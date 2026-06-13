// Grab the whole World Cup 2026 schedule from Sofascore, from your browser.
//
// Open any sofascore.com page (e.g. the World Cup page), open the console
// (Cmd+Option+J), paste this, press Enter. It downloads fixtures.json — then
// upload that on your app's /admin page (Fixtures section).
//
// World Cup = unique-tournament 16, season 58210 (from the network requests).

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
      for (let i = 0; i < 4; i++) {
        try {
          const r = await fetch(path, {
            credentials: "include",
            headers: { Accept: "application/json" },
          });
          if (r.ok) return r.json();
        } catch (_) {}
        await sleep(1500 * (i + 1));
      }
      return null;
    };

    const base = `/api/v1/unique-tournament/${TID}/season/${SID}/events`;
    const all = [];
    for (const kind of ["last", "next"]) {
      for (let page = 0; page < 30; page++) {
        const data = await j(`${base}/${kind}/${page}`);
        if (!data || !data.events) break;
        all.push(...data.events);
        if (!data.hasNextPage) break;
      }
    }

    if (all.length === 0) {
      alert("Got 0 events — open the World Cup page, let the Matches list load, then retry.");
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
