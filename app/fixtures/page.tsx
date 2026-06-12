import type { Metadata } from "next";
import { fixtures } from "../data/fixtures";
import type { Fixture } from "../data/types";

export const metadata: Metadata = { title: "Fixtures — TSZ WC 2026" };

function formatKickoff(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scoreLabel(f: Fixture): string | null {
  if (f.homeScore == null || f.awayScore == null) return null;
  return `${f.homeScore} – ${f.awayScore}`;
}

export default function FixturesPage() {
  // Group by stage, preserving the order stages first appear in the data.
  const stages: string[] = [];
  for (const f of fixtures) if (!stages.includes(f.stage)) stages.push(f.stage);

  return (
    <main>
      <h1 className="mb-6 text-3xl font-bold">Fixtures</h1>

      {fixtures.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge bg-panel/40 p-6 text-center text-muted">
          No fixtures loaded yet. The World Cup 2026 schedule will appear here.
        </div>
      ) : (
        stages.map((stage) => (
          <section key={stage} className="mb-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
              {stage}
            </h2>
            <ul className="divide-y divide-edge overflow-hidden rounded-xl border border-edge">
              {fixtures
                .filter((f) => f.stage === stage)
                .map((f) => {
                  const score = scoreLabel(f);
                  return (
                    <li
                      key={f.id}
                      className="flex items-center justify-between gap-4 bg-panel/40 px-4 py-3"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {f.home}{" "}
                          <span className="text-muted">vs</span> {f.away}
                        </div>
                        <div className="text-xs text-muted">
                          {formatKickoff(f.kickoff)}
                          {f.venue && ` · ${f.venue}`}
                        </div>
                      </div>
                      {score ? (
                        <span className="shrink-0 font-semibold tabular-nums">
                          {score}
                        </span>
                      ) : (
                        f.status === "live" && (
                          <span className="shrink-0 rounded bg-red-500/15 px-2 py-0.5 text-xs text-red-300">
                            LIVE
                          </span>
                        )
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
