import type { Metadata } from "next";
import Link from "next/link";
import { teams } from "../data/teams";
import { teamPointsMap } from "../lib/scores";
import PoolTabs, { resolvePool } from "../components/PoolTabs";

export const metadata: Metadata = { title: "Leaderboard — TSZ WC 2026" };

export default async function LeaderboardPage(
  props: PageProps<"/leaderboard">,
) {
  const { pool } = await props.searchParams;
  const poolId = resolvePool(pool);
  const points = teamPointsMap();

  const filteredTeams = teams
    .filter((team) => team.poolId === poolId)
    .map((team) => ({ team, pts: points.get(team.id) ?? 0 }))
    .sort((a, b) => b.pts - a.pts);

  return (
    <main>
      <h1 className="mb-6 text-3xl font-bold">Leaderboard</h1>

      <PoolTabs basePath="/leaderboard" active={poolId} />

      {filteredTeams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-6 text-center text-zinc-400">
          No teams in this pool yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          {filteredTeams.map(({ team, pts }, index) => (
            <Link
              key={team.id}
              href={`/team/${team.id}`}
              className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/30 px-4 py-3 last:border-b-0 transition-colors hover:bg-zinc-900"
            >
              <span className="flex items-center gap-3">
                <span
                  className={`w-6 text-center text-sm font-bold ${
                    index === 0
                      ? "text-emerald-400"
                      : index < 3
                        ? "text-zinc-300"
                        : "text-zinc-600"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="font-medium">{team.name}</span>
              </span>
              <span className="font-semibold tabular-nums">{pts}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
