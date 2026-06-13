import type { Metadata } from "next";
import { loadFixtures } from "../lib/fixtures";
import type { Fixture } from "../data/types";

export const metadata: Metadata = { title: "Fixtures — TSZ WC 2026" };

// Reads the schedule from disk, so render per request.
export const dynamic = "force-dynamic";

function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "TBD";
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function kickoffTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function scoreLabel(f: Fixture): string | null {
  if (f.homeScore == null || f.awayScore == null) return null;
  return `${f.homeScore} – ${f.awayScore}`;
}

export default function FixturesPage() {
  const fixtures = loadFixtures();

  // Group by calendar day, preserving chronological order.
  const days: string[] = [];
  for (const f of fixtures) {
    const d = dayKey(f.kickoff);
    if (!days.includes(d)) days.push(d);
  }

  return (
    <main className="font-sans">
      <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter text-ink md:text-5xl">
        Fixtures
      </h1>
      <p className="mb-8 text-[15px] font-bold uppercase tracking-widest text-muted">
        {fixtures.length > 0 ? `${fixtures.length} matches` : "World Cup 2026"}
      </p>

      {fixtures.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-edge bg-panel p-8 text-center font-bold uppercase tracking-wide text-muted">
          No fixtures loaded yet. Grab them from Sofascore and upload on{" "}
          <span className="text-ink">/admin</span>.
        </div>
      ) : (
        days.map((day) => (
          <section key={day} className="mb-8">
            {/* Date Header: Exactly matching the screenshot */}
            <h2 className="mb-3 pl-1 text-[13px] font-black uppercase tracking-widest text-muted">
              {day}
            </h2>
            
            {/* Fixture Container Block */}
            <ul className="divide-y divide-edge overflow-hidden rounded-xl border border-edge bg-panel shadow-lg">
              {fixtures
                .filter((f) => dayKey(f.kickoff) === day)
                .map((f) => {
                  const score = scoreLabel(f);
                  return (
                    <li
                      key={f.id}
                      className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-panel2"
                    >
                      {/* Left: Time or Live Tag */}
                      <span className="w-14 shrink-0 text-[13px] font-bold text-muted tabular-nums">
                        {f.status === "live" ? (
                          <span className="rounded-sm bg-red-600 px-2 py-0.5 text-xs font-black text-white shadow-sm animate-pulse">
                            LIVE
                          </span>
                        ) : (
                          kickoffTime(f.kickoff)
                        )}
                      </span>
                      
                      {/* Center: Matchup */}
                      <span className="flex-1 truncate text-[15px] font-bold text-ink transition-colors group-hover:text-brand md:text-[17px]">
                        {f.home} <span className="mx-1 text-[13px] font-normal text-muted">v</span> {f.away}
                      </span>
                      
                      {/* Right: Score or Stage */}
                      {score ? (
                        <span className="shrink-0 text-xl font-black tabular-nums text-ink md:text-2xl">
                          {score}
                        </span>
                      ) : (
                        <span className="shrink-0 text-[12px] font-bold text-muted md:text-[13px]">
                          {f.stage}
                        </span>
                      )}
                    </li>
                  );
                })}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
