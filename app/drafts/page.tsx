import type { Metadata } from "next";
import { drafts, type Draft, type DraftTeam } from "../data/drafts";
import { playerById } from "../data/players";
import { loadFixtures } from "../lib/fixtures";
import { loadScores, playerPointsMap, type ScoresStore } from "../lib/scores";
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

const STAGE_ORDER = new Map<string, number>([
  ["Group stage", 1],
  ["Round 1", 1],
  ["Round 2", 2],
  ["Round 3", 3],
  ["Round of 32", 4],
  ["Round of 16", 5],
  ["Quarterfinals", 6],
  ["Semifinals", 7],
  ["Match for 3rd place", 8],
  ["Final", 9],
]);

function stageRank(stage: string): number | undefined {
  return STAGE_ORDER.get(stage);
}

function eventIdsFromStage(startStage: string, store: ScoresStore): Set<string> {
  const startRank = stageRank(startStage);
  if (startRank == null) return new Set(Object.keys(store.matches));

  const ids = new Set<string>();
  for (const fixture of loadFixtures()) {
    if (fixture.sofascoreId == null) continue;
    const rank = stageRank(fixture.stage);
    if (rank != null && rank >= startRank) ids.add(String(fixture.sofascoreId));
  }
  return ids;
}

function pointsForDraft(draft: Draft, store: ScoresStore): Map<string, number> {
  const eventIds = draft.scoringStartsAt
    ? eventIdsFromStage(draft.scoringStartsAt, store)
    : undefined;
  return playerPointsMap(store, eventIds);
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

function ruleLabel(team: DraftTeam, scoringStartsAt?: string): string {
  const countRule = team.countTop != null
    ? `Best ${team.countTop} count`
    : "All count";
  const stageRule = scoringStartsAt
    ? `From ${scoringStartsAt}`
    : "All matches";
  return `${countRule} · ${stageRule}`;
}

function TeamColumn({
  team,
  scored,
  win,
  scoringStartsAt,
}: {
  team: DraftTeam;
  scored: Scored;
  win: boolean;
  scoringStartsAt?: string;
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
          {ruleLabel(team, scoringStartsAt)}
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
  const store = loadScores();

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
            const base = pointsForDraft(d, store);
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
                  <TeamColumn
                    team={d.teamA}
                    scored={a}
                    win={aWin}
                    scoringStartsAt={d.scoringStartsAt}
                  />
                  <div className="flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-muted md:flex-col">
                    {aWin || bWin ? "" : "draw"}
                    <span className="mx-2 md:my-2">vs</span>
                  </div>
                  <TeamColumn
                    team={d.teamB}
                    scored={b}
                    win={bWin}
                    scoringStartsAt={d.scoringStartsAt}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
