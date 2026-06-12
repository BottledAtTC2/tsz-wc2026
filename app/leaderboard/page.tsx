import type { Metadata } from "next";
import Link from "next/link";
import { teams } from "../data/teams";
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
    <main>
      <h1 className="mb-1 text-3xl font-extrabold tracking-tight">Leaderboard</h1>
      <p className="mb-5 text-sm text-muted">Ranked on total fantasy points.</p>

      <PoolTabs basePath="/leaderboard" active={poolId} />

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge bg-panel/40 p-6 text-center text-muted">
          No teams in this pool yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-edge">
          <div className="grid grid-cols-[3rem_1fr_4rem_4.5rem] items-center gap-2 bg-panel2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
            <span>Rank</span>
            <span>Team</span>
            <span className="text-right">Last</span>
            <span className="text-right">Total</span>
          </div>
          {rows.map(({ team, total, lastPts }, i) => (
            <Link
              key={team.id}
              href={`/team/${team.id}`}
              className="grid grid-cols-[3rem_1fr_4rem_4.5rem] items-center gap-2 border-t border-edge bg-panel/40 px-4 py-3 transition-colors hover:bg-panel"
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                  i === 0
                    ? "bg-accent text-navy"
                    : i < 3
                      ? "bg-brand/20 text-brand"
                      : "text-muted"
                }`}
              >
                {i + 1}
              </span>
              <span className="truncate font-semibold">{team.name}</span>
              <span className="text-right tabular-nums text-muted">
                {lastPts ? `+${lastPts}` : "—"}
              </span>
              <span className="text-right text-lg font-bold tabular-nums">
                {total}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
