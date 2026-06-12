"use client";

import { useState } from "react";

interface IngestResponse {
  error?: string;
  saved?: boolean;
  match?: string;
  scoredPlayers?: number;
  learnedIds?: number;
  players?: { player: string; team: string; role: string; total: number }[];
  unmatchedDrafted?: { name: string; country: string; teamId: string }[];
  unresolvedLineup?: string[];
}

export default function AdminPage() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<IngestResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function ingest() {
    setBusy(true);
    setErr(null);
    setRes(null);
    try {
      const r = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text.trim(),
      });
      const json = (await r.json()) as IngestResponse;
      if (!r.ok) setErr(json.error ?? `HTTP ${r.status}`);
      else setRes(json);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setText(await file.text());
  }

  return (
    <main>
      <h1 className="mb-1 text-3xl font-bold">Ingest a match</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Paste a match&apos;s data (or upload the downloaded{" "}
        <code className="text-zinc-300">match-&lt;id&gt;.json</code>) and click
        Ingest. Points update across the site immediately.
      </p>

      <div className="mb-3 flex items-center gap-3">
        <label className="cursor-pointer rounded-lg bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700">
          Choose file…
          <input
            type="file"
            accept="application/json,.json"
            onChange={onFile}
            className="hidden"
          />
        </label>
        <span className="text-xs text-zinc-500">or paste below</span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='{"event": …, "lineups": …, "incidents": …}'
        spellCheck={false}
        className="h-48 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300 outline-none focus:border-emerald-500/50"
      />

      <button
        onClick={ingest}
        disabled={busy || text.trim().length === 0}
        className="mt-3 rounded-lg bg-emerald-500 px-5 py-2 font-medium text-black disabled:opacity-40"
      >
        {busy ? "Ingesting…" : "Ingest"}
      </button>

      {err && (
        <div className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {err}
        </div>
      )}

      {res && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="font-semibold">{res.match}</div>
            <div className="text-sm text-zinc-400">
              Scored {res.scoredPlayers} players · learned {res.learnedIds} new
              Sofascore ids · {res.saved ? "saved" : "not saved"}
            </div>
          </div>

          {res.players && res.players.length > 0 && (
            <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 text-sm">
              {res.players.map((p) => (
                <li
                  key={p.player}
                  className="flex justify-between bg-zinc-900/30 px-4 py-2"
                >
                  <span>
                    {p.player}{" "}
                    <span className="text-zinc-500">
                      · {p.team}
                      {p.role !== "none" && ` · ${p.role}`}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums">{p.total}</span>
                </li>
              ))}
            </ul>
          )}

          {res.unmatchedDrafted && res.unmatchedDrafted.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
              <div className="mb-1 font-medium text-amber-300">
                Drafted players from these nations weren&apos;t scored
              </div>
              <div className="mb-2 text-xs text-zinc-400">
                Benched/injured is fine. If one actually played, their name in
                players.ts doesn&apos;t match Sofascore — fix and re-ingest.
              </div>
              <ul className="text-zinc-300">
                {res.unmatchedDrafted.map((u) => (
                  <li key={u.name}>
                    {u.name}{" "}
                    <span className="text-zinc-500">
                      ({u.country}, {u.teamId})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
