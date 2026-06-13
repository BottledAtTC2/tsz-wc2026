// Grab the whole World Cup 2026 schedule from Sofascore, from your browser.
//
// Open any sofascore.com page (the World Cup page is ideal), open the console
// (Cmd+Option+J), paste this, press Enter. It downloads fixtures.json — then
// upload that on your app's /admin page (Fixtures section). It merges with
// anything already loaded, so re-running is safe.
//
// World Cup = unique-tournament 16, season 58210 (from the network requests).
// It pulls the finished/upcoming lists AND every round, so all matchdays and
// knockout rounds are captured.

(async () => {
  try {
    const TID = 16;
    const SID = 58210;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // Sofascore challenges repeat fetches; read from cache first, then retry.
    const j = async (path) => {
      try {
        const r = await fetch(path, {
          credentials: "include",
          cache: "force-cache",
          headers: { Accept: "application/json" },
        });
        if (r.ok) return r.json();
      } catch (_) {}
      for (let i = 0; i < 3; i++) {
        try {
          const r = await fetch(path, {
            credentials: "include",
            headers: { Accept: "application/json" },
          });
          if (r.ok) return r.json();
        } catch (_) {}
        await sleep(1200 * (i + 1));
      }
      return null;
    };

    const base = `/api/v1/unique-tournament/${TID}/season/${SID}/events`;
    const seen = new Map();
    const add = (data) => {
      if (data && Array.isArray(data.events))
        for (const e of data.events) seen.set(e.id, e);
    };

    // Finished + upcoming lists (paginated).
    for (const kind of ["last", "next"]) {
      for (let page = 0; page < 40; page++) {
        const d = await j(`${base}/${kind}/${page}`);
        if (!d || !d.events || d.events.length === 0) break;
        add(d);
        if (!d.hasNextPage) break;
      }
    }
    // Every round (group matchdays + knockouts) — captures matches not yet played.
    for (let round = 1; round <= 20; round++) {
      add(await j(`${base}/round/${round}`));
    }

    const all = [...seen.values()];
    if (all.length === 0) {
      alert("Got 0 events — open the World Cup page, let Matches load, then retry.");
      return;
    }

    const text = JSON.stringify({ events: all });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = "fixtures.json";
    a.click();
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {}
    console.log("✅ fixtures.json:", all.length, "matches");
    alert(`Downloaded fixtures.json (${all.length} matches). Upload it on your app /admin.`);
  } catch (e) {
    alert("Failed: " + e.message);
  }
})();
