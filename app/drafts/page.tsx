import type { Metadata } from "next";
import { drafts, type DraftTeam } from "../data/drafts";
import { playerById } from "../data/players";
import { playerPointsMap } from "../lib/scores";
import { SCORING } from "../lib/scoring";

export const metadata: Metadata = { title: "Drafts — TSZ WC 2026" };

// Reads computed points from disk, so render per request.
export const dynamic = "force-dynamic";

function multiplierFor(team: DraftTeam, pid: string): number {
  if (pid === team.captainId) return SCORING.captainMultiplier;
  if (pid === team.viceCaptainId) return SCORING.viceCaptainMultiplier;
  return 1;
}

interface Scored {
  total: number;
  rows: { pid: string; pts: number; mult: number; counted: boolean }[];
}

// A draft team's score = each player's base season points × that team's
// captain/vice multiplier; if countTop is set, only the best N count.
function scoreTeam(team: DraftTeam, base: Map<string, number>): Scored {
  const rows = team.squad.map((pid) => {
    const mult = multiplierFor(team, pid);
    return { pid, mult, pts: (base.get(pid) ?? 0) * mult, counted: true };
  });
  const ranked = [...rows].sort((a, b) => b.pts - a.pts);
  if (team.countTop != null) {
    const keep = new Set(ranked.slice(0, team.countTop).map((r) => r.pid));
    for (const r of rows) r.counted = keep.has(r.pid);
  }
  const total = rows.reduce((s, r) => (r.counted ? s + r.pts : s), 0);
  return { total, rows };
}

function ruleLabel(team: DraftTeam): string {
  return team.countTop != null
    ? `Best ${team.countTop} count`
    : "All count";
}

function TeamColumn({
  team,
  scored,
  win,
}: {
  team: DraftTeam;
  scored: Scored;
  win: boolean;
}) {
  return (
    <div className="flex-1">
      <div className="mb-3 border-b border-edge pb-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-lg font-black uppercase tracking-tight text-ink">
            {team.name}
          </span>
          <span
            className={`text-3xl font-black tabular-nums ${win ? "text-brand" : "text-muted"}`}
          >
            {Math.round(scored.total * 10) / 10}
          </span>
        </div>
        <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted">
          {ruleLabel(team)}
        </div>
      </div>
      <ul className="space-y-1">
        {scored.rows
          .slice()
          .sort((a, b) => b.pts - a.pts)
          .map((r) => {
            const p = playerById.get(r.pid);
            const isC = r.pid === team.captainId;
            const isVc = r.pid === team.viceCaptainId;
            return (
              <li
                key={r.pid}
                className={`flex items-center justify-between gap-2 text-[13px] font-bold ${
                  r.counted ? "" : "opacity-40"
                }`}
              >
                <span className="truncate text-ink">
                  {p?.name ?? r.pid}
                  {isC && <span className="ml-1 text-brand">C</span>}
                  {isVc && <span className="ml-1 text-accent">V</span>}
                </span>
                <span className="shrink-0 tabular-nums text-muted">
                  {Math.round(r.pts * 10) / 10}
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default function DraftsPage() {
  const base = playerPointsMap();

  return (
    <main className="font-sans">
      <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter text-ink md:text-5xl">
        Drafts
      </h1>
      <p className="mb-8 text-[15px] font-bold uppercase tracking-widest text-muted">
        Head-to-head 1v1 matchups
      </p>

      {drafts.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-edge bg-panel p-8 text-center font-bold uppercase tracking-wide text-muted">
          No drafts added yet.
        </div>
      ) : (
        <div className="space-y-5">
          {drafts.map((d) => {
            const a = scoreTeam(d.teamA, base);
            const b = scoreTeam(d.teamB, base);
            const aWin = a.total > b.total;
            const bWin = b.total > a.total;
            return (
              <div
                key={d.id}
                className="overflow-hidden rounded-xl border border-edge bg-panel shadow-lg"
              >
                {d.title && (
                  <div className="border-b border-edge bg-panel2 px-5 py-2 text-[11px] font-black uppercase tracking-widest text-muted">
                    {d.title}
                  </div>
                )}
                <div className="flex flex-col gap-5 p-5 md:flex-row">
                  <TeamColumn team={d.teamA} scored={a} win={aWin} />
                  <div className="flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-muted md:flex-col">
                    {aWin || bWin ? "" : "draw"}
                    <span className="mx-2 md:my-2">vs</span>
                  </div>
                  <TeamColumn team={d.teamB} scored={b} win={bWin} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
