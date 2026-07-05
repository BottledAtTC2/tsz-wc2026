// Grab one Sofascore match's data straight from your browser (which already
// passes the challenge). Two ways to use it:
//
// A) Console: open a match on sofascore.com, open DevTools console
//    (Cmd+Option+J), paste this whole file, press Enter. It downloads
//    match-<id>.json — then upload that on your app's /admin page.
//
// B) Bookmarklet (one click, reusable): make a new bookmark whose URL is the
//    single "javascript:" line at the bottom of this file, then click it while
//    on a match page.

(async () => {
  try {
    const m =
      location.href.match(/id:(\d+)/) || location.href.match(/(\d{6,})/);
    const id =
      (m && m[1]) ||
      prompt("Sofascore event id (the number in the match URL after #id:)?");
    if (!id) return;

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const base = "/api/v1/event/" + id;

    // Fetch a URL with cache-busting retries on failure.
    // `cacheMode` lets callers choose "force-cache" (fast, use cached response)
    // or "reload" (always hit the network, needed for lineups whose stats can
    // be stale from a regulation-time cache entry on ET matches).
    const j = async (p, cacheMode = "force-cache") => {
      try {
        const r = await fetch(p, {
          credentials: "include",
          cache: cacheMode,
          headers: { Accept: "application/json" },
        });
        if (r.ok) return r.json();
      } catch (_) {}
      for (let i = 0; i < 4; i++) {
        try {
          const r = await fetch(p, {
            credentials: "include",
            headers: { Accept: "application/json" },
          });
          if (r.ok) return r.json();
        } catch (_) {}
        await sleep(1500 * (i + 1));
      }
      throw new Error("blocked on " + p + " (try reloading the match page)");
    };

    const bundle = {
      event: (await j(base)).event,
      // Always bypass cache for lineups — the browser may have cached the
      // regulation-time stats and extra-time goals/assists would be missing.
      lineups: await j(base + "/lineups", "reload"),
      incidents: await j(base + "/incidents"),
    };

    const text = JSON.stringify(bundle);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = "match-" + id + ".json";
    a.click();
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {}

    const e = bundle.event;
    console.log(
      "✅ match-" + id + ".json",
      (e.homeTeam && e.homeTeam.name) + " vs " + (e.awayTeam && e.awayTeam.name),
    );
    alert(
      "Downloaded match-" + id + ".json (also copied to clipboard).\n" +
        "Now open your app's /admin page and upload or paste it.",
    );
  } catch (e) {
    alert("Failed: " + e.message + "\nMake sure the match page is fully loaded.");
  }
})();

// --- Bookmarklet version (everything on one line; use as the bookmark URL) ---
// javascript:(async()=>{try{const m=location.href.match(/id:(\d+)/)||location.href.match(/(\d{6,})/);const id=(m&&m[1])||prompt("Sofascore event id?");if(!id)return;const s=ms=>new Promise(r=>setTimeout(r,ms));const b="/api/v1/event/"+id;const j=async(p,c="force-cache")=>{try{const r=await fetch(p,{credentials:"include",cache:c,headers:{Accept:"application/json"}});if(r.ok)return r.json()}catch(_){}for(let i=0;i<4;i++){try{const r=await fetch(p,{credentials:"include",headers:{Accept:"application/json"}});if(r.ok)return r.json()}catch(_){}await s(1500*(i+1))}throw new Error("blocked "+p)};const o={event:(await j(b)).event,lineups:await j(b+"/lineups","reload"),incidents:await j(b+"/incidents")};const t=JSON.stringify(o);const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"application/json"}));a.download="match-"+id+".json";a.click();try{await navigator.clipboard.writeText(t)}catch(_){}alert("Downloaded match-"+id+".json. Open your app /admin and upload it.")}catch(e){alert("Failed: "+e.message)}})();
