import type { Metadata } from "next";
import Link from "next/link";
import { teams } from "../data/teams";
import { pools } from "../data/pools";
import { teamPointsMap, loadScores } from "../lib/scores";
import { loadFixtures } from "../lib/fixtures";
import PoolTabs, { resolvePool } from "../components/PoolTabs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Leaderboard — TSZ WC 2026" };

/**
 * Event ids of the scored matches in the latest round — the round of the most
 * recently played scored match, grouped by the fixtures' round label.
 */
function latestRoundEventIds(store: ReturnType<typeof loadScores>): Set<string> {
  const stageById = new Map<number, string>();
  const kickoffById = new Map<number, string>();
  for (const f of loadFixtures()) {
    if (f.sofascoreId == null) continue;
    if (f.stage) stageById.set(f.sofascoreId, f.stage);
    kickoffById.set(f.sofascoreId, f.kickoff ?? "");
  }
  const scored = Object.keys(store.matches);
  // Find the latest-kicking-off scored match; its round is the current round.
  let latest: { kickoff: string; stage: string } | null = null;
  for (const eid of scored) {
    const n = Number(eid);
    const stage = stageById.get(n);
    if (!stage) continue;
    const kickoff = kickoffById.get(n) ?? "";
    if (!latest || kickoff > latest.kickoff) latest = { kickoff, stage };
  }
  // No round info → treat all scored matches as the round (RD == Total).
  if (!latest) return new Set(scored);
  return new Set(scored.filter((eid) => stageById.get(Number(eid)) === latest!.stage));
}

export default async function LeaderboardPage(
  props: PageProps<"/leaderboard">,
) {
  const { pool } = await props.searchParams;
  const poolId = resolvePool(pool);
  const store = loadScores();
  const points = teamPointsMap(store);
  const roundPoints = teamPointsMap(store, latestRoundEventIds(store));

  const countTop = pools.find((p) => p.id === poolId)?.countTop;
  const ruleText = countTop
    ? `Each team's best ${countTop} of 11 players count.`
    : "All 11 players count.";

  const rows = teams
    .filter((team) => team.poolId === poolId)
    .map((team) => ({
      team,
      total: points.get(team.id) ?? 0,
      lastPts: roundPoints.get(team.id) ?? 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <main className="font-sans">
      <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter text-ink">
        Leaderboard
      </h1>
      <p className="mb-6 text-[15px] font-bold text-muted">{ruleText}</p>

      <PoolTabs basePath="/leaderboard" active={poolId} />

      {rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-edge bg-panel p-8 text-center font-bold text-muted">
          NO TEAMS IN THIS POOL YET.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-panel shadow-xl">
          
          {/* Table Header: Matched to screenshot strings and styling */}
          <div className="grid grid-cols-[3rem_1fr_4rem_4.5rem] items-center gap-3 bg-panel2 px-4 py-4 text-xs font-black uppercase tracking-wider text-muted md:grid-cols-[4rem_1fr_5rem_6rem] md:text-sm">
            <span className="text-center">Rank</span>
            <span>Display Name</span>
            <span className="text-right">RD Pts</span>
            <span className="text-right">Total Pts</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-edge">
            {rows.map(({ team, total, lastPts }, i) => (
              <Link
                key={team.id}
                href={`/team/${team.id}`}
                className="grid grid-cols-[3rem_1fr_4rem_4.5rem] items-center gap-3 bg-panel px-4 py-3.5 transition-colors hover:bg-panel2 md:grid-cols-[4rem_1fr_5rem_6rem]"
              >
                {/* Rank Badge: Highlighting Top 3 */}
                <span
                  className={`mx-auto flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-sm text-[13px] md:text-sm font-black shadow-sm ${
                    i === 0
                      ? "bg-brand text-black" // Rank 1 gets full neon lime
                      : i < 3
                        ? "bg-panel2 text-brand" // Ranks 2 & 3 get neon text
                        : "bg-transparent text-muted" // Rest are standard muted
                  }`}
                >
                  {i + 1}
                </span>

                {/* Team Name */}
                <span className="truncate text-[15px] font-bold text-ink md:text-base">
                  {team.name}
                </span>

                {/* Round Points (Last) */}
                <span className="text-right text-[15px] font-bold tabular-nums text-muted md:text-base">
                  {lastPts ? `+${lastPts}` : "—"}
                </span>

                {/* Total Points */}
                <span className="text-right text-lg font-black tabular-nums text-ink md:text-xl">
                  {total}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
