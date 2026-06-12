#!/usr/bin/env python3
"""Fetch World Cup 2026 match data from Sofascore and feed it to the app.

Sofascore fingerprints TLS, so a plain request gets 403'd. This uses
curl_cffi's Chrome impersonation (same trick as tunjayoff/sofascore_scraper)
to get through.

Setup (once):
    cd scripts
    python3 -m venv venv && source venv/bin/activate
    pip install -r requirements.txt

Usage:
    # 1) See the World Cup matches and their event ids:
    python scrape.py list

    # 2) Ingest finished matches into your running app (npm run dev):
    python scrape.py ingest 12345678 12345679

    # ...or ingest every finished match found so far:
    python scrape.py ingest --all

    # Just save the raw bundles to data/matches/ (e.g. to inspect/commit):
    python scrape.py save 12345678

Config via env vars:
    APP_URL            default http://localhost:3000  (your running app)
    WC_TOURNAMENT_ID   default 16  (FIFA World Cup on Sofascore)
    WC_SEASON_ID       override the auto-detected 2026 season id
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

try:
    from curl_cffi import requests as creq
except ImportError:
    sys.exit("Missing dependency. Run:  pip install -r scripts/requirements.txt")

BASE = os.environ.get("SOFA_BASE", "https://www.sofascore.com").rstrip("/")
API = f"{BASE}/api/v1"
APP_URL = os.environ.get("APP_URL", "http://localhost:3000").rstrip("/")
TOURNAMENT_ID = os.environ.get("WC_TOURNAMENT_ID", "16")
IMPERSONATE = os.environ.get("IMPERSONATE", "chrome120")
USE_BROWSER = bool(os.environ.get("SOFA_BROWSER"))
CDP_URL = os.environ.get("SOFA_CDP", "http://localhost:9222")
USE_CONNECT = False
HEADERS = {
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": f"{BASE}/",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
}

_session = creq.Session(impersonate=IMPERSONATE, headers=HEADERS, timeout=30)
_warmed = False


def _warm_up() -> None:
    """Hit the homepage once so Cloudflare can set clearance cookies."""
    global _warmed
    if _warmed:
        return
    _warmed = True
    try:
        _session.get(f"{BASE}/", timeout=30)
        time.sleep(1)
    except Exception as e:  # noqa: BLE001
        print(f"  (warm-up failed: {e})", file=sys.stderr)


def _http_get(path: str) -> dict:
    """GET an API path with warm-up + retry/backoff (curl_cffi backend)."""
    _warm_up()
    url = f"{API}{path}"
    for attempt in range(4):
        r = _session.get(url)
        if r.status_code == 200:
            return r.json()
        if r.status_code in (403, 429, 503):
            if attempt == 0:
                snippet = r.text[:200].replace("\n", " ")
                print(f"  {r.status_code} body: {snippet!r}", file=sys.stderr)
            wait = 3 * (2**attempt)
            print(f"  {r.status_code} on {path}; retrying in {wait}s", file=sys.stderr)
            time.sleep(wait)
            continue
        raise RuntimeError(f"{r.status_code} fetching {path}")
    raise RuntimeError(
        f"giving up on {path} ({r.status_code}). Sofascore is blocking this "
        "request — try the browser method:  python scrape.py list --browser"
    )


# Hide the automation signals the challenge looks for.
_STEALTH_JS = """
Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});
Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
window.chrome = window.chrome || { runtime: {} };
const _q = window.navigator.permissions && window.navigator.permissions.query;
if (_q) {
  window.navigator.permissions.query = (p) =>
    p && p.name === 'notifications'
      ? Promise.resolve({ state: Notification.permission })
      : _q(p);
}
"""

_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)


class _Browser:
    """Real-Chrome backend (Playwright) that solves the JS challenge."""

    def __init__(self) -> None:
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            sys.exit("Browser mode needs Playwright. Run:\n    pip install playwright")
        self._pw = sync_playwright().start()

        if USE_CONNECT:
            # Attach to a Chrome you launched yourself (you solve the challenge).
            print(f"Connecting to your Chrome at {CDP_URL} …")
            self._browser = self._pw.chromium.connect_over_cdp(CDP_URL)
            ctx = (
                self._browser.contexts[0]
                if self._browser.contexts
                else self._browser.new_context()
            )
            self._page = ctx.new_page()
            self._goto_home()
            return

        try:
            # Use the real Chrome you already have installed.
            self._browser = self._pw.chromium.launch(channel="chrome", headless=False)
        except Exception:
            self._browser = self._pw.chromium.launch(headless=False)
        ctx = self._browser.new_context(
            user_agent=_UA, locale="en-US", viewport={"width": 1280, "height": 800}
        )
        ctx.add_init_script(_STEALTH_JS)
        self._page = ctx.new_page()
        print("Opening Sofascore in Chrome to clear the challenge…")
        self._goto_home()

    def _goto_home(self) -> None:
        self._page.goto(f"{BASE}/", wait_until="domcontentloaded", timeout=60000)
        time.sleep(5)

    def _fetch(self, path: str) -> dict:
        return self._page.evaluate(
            "async (u) => { const r = await fetch(u, {headers:{Accept:'application/json'}});"
            " return { s: r.status, t: await r.text() }; }",
            f"{API}{path}",
        )

    def get_json(self, path: str) -> dict:
        for attempt in range(5):
            res = self._fetch(path)
            if res["s"] == 200:
                return json.loads(res["t"])
            if res["s"] in (403, 429, 503):
                print(
                    f"  challenge not cleared (try {attempt + 1}/5); waiting…",
                    file=sys.stderr,
                )
                time.sleep(4)
                if attempt == 2:
                    self._goto_home()  # reload once midway
                continue
            raise RuntimeError(f"{res['s']} fetching {path}: {res['t'][:160]}")
        raise RuntimeError(
            f"still blocked on {path} after retries. The challenge isn't clearing "
            "in automated Chrome — we'll connect to your own Chrome instead."
        )

    def close(self) -> None:
        try:
            if USE_CONNECT:
                self._page.close()  # leave your Chrome running
            else:
                self._browser.close()
            self._pw.stop()
        except Exception:  # noqa: BLE001
            pass


_browser: _Browser | None = None


def get(path: str) -> dict:
    """Dispatch to the browser or curl_cffi backend."""
    global _browser
    if USE_BROWSER:
        if _browser is None:
            _browser = _Browser()
        return _browser.get_json(path)
    return _http_get(path)


def resolve_season() -> str:
    """Find the 2026 World Cup season id (or use WC_SEASON_ID override)."""
    override = os.environ.get("WC_SEASON_ID")
    if override:
        return override
    data = get(f"/unique-tournament/{TOURNAMENT_ID}/seasons")
    for s in data.get("seasons", []):
        if "2026" in str(s.get("year", "")) or "2026" in str(s.get("name", "")):
            return str(s["id"])
    raise SystemExit(
        "Could not auto-find the 2026 season. Set WC_SEASON_ID — the available "
        f"seasons are: {[ (s.get('year'), s.get('id')) for s in data.get('seasons', []) ]}"
    )


def all_events(season_id: str) -> list[dict]:
    """All events for the season (finished 'last' + upcoming 'next'), paginated."""
    out: list[dict] = []
    for kind in ("last", "next"):
        page = 0
        while True:
            data = get(
                f"/unique-tournament/{TOURNAMENT_ID}/season/{season_id}/events/{kind}/{page}"
            )
            out.extend(data.get("events", []))
            if not data.get("hasNextPage"):
                break
            page += 1
    return out


def is_finished(ev: dict) -> bool:
    return ev.get("status", {}).get("type") == "finished"


def fetch_bundle(event_id: int) -> dict:
    """Fetch the three endpoints and assemble the bundle the app expects."""
    event = get(f"/event/{event_id}")["event"]
    lineups = get(f"/event/{event_id}/lineups")
    incidents = get(f"/event/{event_id}/incidents")
    return {"event": event, "lineups": lineups, "incidents": incidents}


def post_ingest(bundle: dict) -> dict:
    """POST a bundle to the app's /api/ingest (localhost — no impersonation)."""
    body = json.dumps(bundle).encode()
    req = urllib.request.Request(
        f"{APP_URL}/api/ingest",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def cmd_list(_args) -> None:
    season = resolve_season()
    print(f"World Cup season id: {season}\n")
    events = all_events(season)
    events.sort(key=lambda e: e.get("startTimestamp", 0))
    for ev in events:
        status = ev.get("status", {}).get("type", "?")
        h = ev.get("homeTeam", {}).get("name", "?")
        a = ev.get("awayTeam", {}).get("name", "?")
        hs = ev.get("homeScore", {}).get("current", "")
        as_ = ev.get("awayScore", {}).get("current", "")
        score = f"{hs}-{as_}" if status == "finished" else ""
        mark = "✓" if status == "finished" else " "
        print(f"  {mark} {ev['id']:>10}  [{status:<9}] {h} {score} {a}")
    print(f"\n{sum(is_finished(e) for e in events)} finished. "
          "Ingest with:  python scrape.py ingest <id> <id> ...")


def cmd_ingest(args) -> None:
    ids = collect_ids(args)
    for eid in ids:
        print(f"Ingesting {eid} …")
        try:
            bundle = fetch_bundle(eid)
            res = post_ingest(bundle)
        except Exception as e:  # noqa: BLE001
            print(f"  ! {e}")
            continue
        print(f"  {res.get('match')}  → scored {res.get('scoredPlayers')} players, "
              f"learned {res.get('learnedIds')} ids")
        um = res.get("unmatchedDrafted") or []
        if um:
            print("  ⚠ drafted players from these nations not scored "
                  "(benched, or a name to fix in players.ts):")
            for u in um:
                print(f"      - {u['name']} ({u['country']}, {u['teamId']})")
        time.sleep(1)


def cmd_save(args) -> None:
    ids = collect_ids(args)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    for eid in ids:
        print(f"Saving {eid} …")
        bundle = fetch_bundle(eid)
        path = out_dir / f"{eid}.json"
        path.write_text(json.dumps(bundle, indent=2))
        print(f"  wrote {path}")
        time.sleep(1)


def collect_ids(args) -> list[int]:
    if getattr(args, "all", False):
        season = resolve_season()
        return [e["id"] for e in all_events(season) if is_finished(e)]
    if not args.ids:
        sys.exit("Pass event ids, or --all. See:  python scrape.py list")
    return [int(x) for x in args.ids]


def main() -> None:
    p = argparse.ArgumentParser(description="Sofascore → app ingest for WC2026")
    sub = p.add_subparsers(dest="cmd", required=True)

    # Shared flag: --browser uses real Chrome (Playwright) to beat the challenge.
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument(
        "--browser",
        action="store_true",
        help="use real Chrome (Playwright) to bypass the JS challenge",
    )
    common.add_argument(
        "--connect",
        action="store_true",
        help="attach to your own Chrome started with --remote-debugging-port=9222",
    )

    sub.add_parser(
        "list", parents=[common], help="list WC matches and their event ids"
    ).set_defaults(func=cmd_list)

    pi = sub.add_parser("ingest", parents=[common], help="fetch + POST matches")
    pi.add_argument("ids", nargs="*", help="Sofascore event ids")
    pi.add_argument("--all", action="store_true", help="every finished match")
    pi.set_defaults(func=cmd_ingest)

    ps = sub.add_parser("save", parents=[common], help="fetch + write bundle JSON")
    ps.add_argument("ids", nargs="*", help="Sofascore event ids")
    ps.add_argument("--all", action="store_true", help="every finished match")
    ps.add_argument("--out", default="data/matches", help="output directory")
    ps.set_defaults(func=cmd_save)

    args = p.parse_args()
    global USE_BROWSER, USE_CONNECT
    USE_CONNECT = getattr(args, "connect", False) or USE_CONNECT
    USE_BROWSER = USE_BROWSER or getattr(args, "browser", False) or USE_CONNECT
    try:
        args.func(args)
    finally:
        if _browser is not None:
            _browser.close()


if __name__ == "__main__":
    main()
