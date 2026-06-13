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
    <main>
      <h1 className="mb-1 text-3xl font-extrabold tracking-tight">Fixtures</h1>
      <p className="mb-5 text-sm text-muted">
        {fixtures.length > 0 ? `${fixtures.length} matches` : "World Cup 2026"}
      </p>

      {fixtures.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge bg-panel/40 p-6 text-center text-muted">
          No fixtures loaded yet. Grab them from Sofascore and upload on{" "}
          <span className="text-ink">/admin</span>.
        </div>
      ) : (
        days.map((day) => (
          <section key={day} className="mb-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
              {day}
            </h2>
            <ul className="divide-y divide-edge overflow-hidden rounded-xl border border-edge">
              {fixtures
                .filter((f) => dayKey(f.kickoff) === day)
                .map((f) => {
                  const score = scoreLabel(f);
                  return (
                    <li
                      key={f.id}
                      className="flex items-center gap-3 bg-panel/40 px-4 py-3"
                    >
                      <span className="w-12 shrink-0 text-xs text-muted tabular-nums">
                        {f.status === "live" ? (
                          <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-red-300">
                            LIVE
                          </span>
                        ) : (
                          kickoffTime(f.kickoff)
                        )}
                      </span>
                      <span className="flex-1 truncate font-medium">
                        {f.home} <span className="text-muted">v</span> {f.away}
                      </span>
                      {score ? (
                        <span className="shrink-0 font-bold tabular-nums">
                          {score}
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs text-muted">
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
