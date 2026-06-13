import type { Metadata } from "next";
import Link from "next/link";
import { teams } from "../data/teams";
import { pools } from "../data/pools";
import { teamPointsMap, teamBreakdown, loadScores } from "../lib/scores";
import PoolTabs, { resolvePool } from "../components/PoolTabs";

export const metadata: Metadata = { title: "Leaderboard — TSZ WC 2026" };

export default async function LeaderboardPage(
  props: PageProps<"/leaderboard">,
) {
  const { pool } = await props.searchParams;
  const poolId = resolvePool(pool);
  const store = loadScores();
  const points = teamPointsMap(store);

  const countTop = pools.find((p) => p.id === poolId)?.countTop;
  const ruleText = countTop
    ? `Each team's best ${countTop} of 11 players count.`
    : "All 11 players count.";

  const rows = teams
    .filter((team) => team.poolId === poolId)
    .map((team) => {
      const last = teamBreakdown(team.id, store)[0];
      const lastPts = last
        ? last.contributions.reduce((s, c) => s + c.total, 0)
        : 0;
      return { team, total: points.get(team.id) ?? 0, lastPts };
    })
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
