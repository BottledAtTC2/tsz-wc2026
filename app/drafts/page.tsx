import type { Metadata } from "next";
import { Fragment } from "react";
import { drafts, type Draft, type DraftTeam } from "../data/drafts";
import { playerById } from "../data/players";
import { loadFixtures } from "../lib/fixtures";
import {
  loadScores,
  rosterPlayerBreakdowns,
  rosterSlotTotals,
  type ScoresStore,
} from "../lib/scores";
import {
  latestScoredEventId,
  rosterDisplayPlayers,
} from "../lib/rosterDisplay";
import { roleForPlayerInEvent } from "../lib/replacements";

export const metadata: Metadata = { title: "Drafts — TSZ WC 2026" };

// Reads computed points from disk, so render per request.
export const dynamic = "force-dynamic";

interface Scored {
  total: number;
  rows: {
    pid: string;
    originalId: string;
    pts: number;
    counted: boolean;
    replacementFor?: string;
    replacedBy?: string;
    role: "captain" | "vice" | "none";
  }[];
}

interface ScoredDraftTeam {
  team: DraftTeam;
  scored: Scored;
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

function eventIdsForDraft(draft: Draft, store: ScoresStore): Set<string> | undefined {
  return draft.scoringStartsAt
    ? eventIdsFromStage(draft.scoringStartsAt, store)
    : undefined;
}

// A draft team's score = each player's base season points × that team's
// captain/vice multiplier; if countTop is set, only the best N count.
function scoreTeam(
  team: DraftTeam,
  store: ScoresStore,
  eventIds?: Set<string>,
): Scored {
  const slotTotals = rosterSlotTotals(team, store, eventIds);
  const playerBreakdowns = rosterPlayerBreakdowns(team, store, eventIds);
  const latestEventId = latestScoredEventId(store);
  const ranked = team.squad
    .map((pid) => ({ pid, pts: slotTotals.get(pid) ?? 0 }))
    .sort((a, b) => b.pts - a.pts);
  const keep = new Set(team.squad);
  if (team.countTop != null) {
    keep.clear();
    for (const r of ranked.slice(0, team.countTop)) keep.add(r.pid);
  }
  const rows = rosterDisplayPlayers(team).map((row) => {
    const role = latestEventId
      ? roleForPlayerInEvent(team, row.player.id, latestEventId)
      : row.player.id === team.captainId
        ? "captain"
        : row.player.id === team.viceCaptainId
          ? "vice"
          : "none";
    return {
      pid: row.player.id,
      originalId: row.originalId,
      pts: playerBreakdowns.get(row.player.id)?.total ?? 0,
      counted: keep.has(row.originalId),
      replacementFor: row.replacementFor?.id,
      replacedBy: row.replacedBy?.id,
      role,
    };
  });
  const total = ranked
    .filter((r) => keep.has(r.pid))
    .reduce((s, r) => s + r.pts, 0);
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

function draftTitle(draft: Draft): string {
  return draft.title ?? draft.teams.map((team) => team.name).join(" vs ");
}

function winnerIndex(scoredTeams: ScoredDraftTeam[]): number | undefined {
  const highScore = Math.max(...scoredTeams.map(({ scored }) => scored.total));
  const leaders = scoredTeams.filter(({ scored }) => scored.total === highScore);
  return leaders.length === 1 ? scoredTeams.indexOf(leaders[0]) : undefined;
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
            const replacementFor = r.replacementFor
              ? playerById.get(r.replacementFor)
              : undefined;
            const isReplacement = Boolean(r.replacementFor);
            const isInjured = Boolean(r.replacedBy);
            const isC = r.role === "captain";
            const isVc = r.role === "vice";
            return (
              <li
                key={`${r.pid}-${r.replacementFor ?? "original"}`}
                className={`flex items-start justify-between gap-2 rounded-sm px-1.5 py-1 text-[13px] font-bold ${
                  r.counted ? "" : "opacity-40"
                } ${
                  isInjured
                    ? "bg-white/5 text-muted opacity-60"
                    : isReplacement
                      ? "bg-brand/10"
                      : ""
                }`}
              >
                <span className="min-w-0 text-ink">
                  <span className={isInjured ? "line-through" : ""}>
                    {p?.name ?? r.pid}
                  </span>
                  {isC && <span className="ml-1 text-brand">C</span>}
                  {isVc && <span className="ml-1 text-accent">V</span>}
                  {(isReplacement || isInjured) && (
                    <span className="mt-0.5 block truncate text-[9px] font-black uppercase tracking-widest text-muted">
                      {isReplacement
                        ? `Replacement for ${replacementFor?.name ?? r.replacementFor}`
                        : "Injured / ruled out"}
                    </span>
                  )}
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
        Head-to-head matchups
      </p>

      {drafts.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-edge bg-panel p-8 text-center font-bold uppercase tracking-wide text-muted">
          No drafts added yet.
        </div>
      ) : (
        <div className="space-y-5">
          {drafts.map((d) => {
            const eventIds = eventIdsForDraft(d, store);
            const scoredTeams = d.teams.map((team) => ({
              team,
              scored: scoreTeam(team, store, eventIds),
            }));
            const winner = winnerIndex(scoredTeams);
            const draw = winner == null;
            return (
              <div
                key={d.id}
                className="overflow-hidden rounded-xl border border-edge bg-panel shadow-lg"
              >
                <div className="border-b border-edge bg-panel2 px-5 py-2 text-[11px] font-black uppercase tracking-widest text-muted">
                  {draftTitle(d)}
                </div>
                <div className="flex flex-col gap-5 p-5 md:flex-row">
                  {scoredTeams.map(({ team, scored }, index) => (
                    <Fragment key={`${d.id}-${team.name}`}>
                      {index > 0 && (
                        <div className="flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-muted md:flex-col">
                          {draw && index === 1 ? "draw" : ""}
                          <span className="mx-2 md:my-2">vs</span>
                        </div>
                      )}
                      <TeamColumn
                        team={team}
                        scored={scored}
                        win={winner === index}
                        scoringStartsAt={d.scoringStartsAt}
                      />
                    </Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
