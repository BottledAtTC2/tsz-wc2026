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

    const base = "/api/v1/event/" + id;
    const j = async (p) => {
      const r = await fetch(p, { headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(r.status + " on " + p);
      return r.json();
    };

    const bundle = {
      event: (await j(base)).event,
      lineups: await j(base + "/lineups"),
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
// javascript:(async()=>{try{const m=location.href.match(/id:(\d+)/)||location.href.match(/(\d{6,})/);const id=(m&&m[1])||prompt("Sofascore event id?");if(!id)return;const b="/api/v1/event/"+id;const j=async p=>{const r=await fetch(p,{headers:{Accept:"application/json"}});if(!r.ok)throw new Error(r.status+" "+p);return r.json()};const o={event:(await j(b)).event,lineups:await j(b+"/lineups"),incidents:await j(b+"/incidents")};const t=JSON.stringify(o);const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"application/json"}));a.download="match-"+id+".json";a.click();try{await navigator.clipboard.writeText(t)}catch(_){}alert("Downloaded match-"+id+".json. Open your app /admin and upload it.")}catch(e){alert("Failed: "+e.message)}})();
