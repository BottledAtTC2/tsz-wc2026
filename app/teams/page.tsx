import type { Metadata } from "next";
import Link from "next/link";
import { teams } from "../data/teams";
import { playerById } from "../data/players";
import { teamPointsMap } from "../lib/scores";
import PoolTabs, { resolvePool } from "../components/PoolTabs";

export const metadata: Metadata = { title: "Teams — TSZ WC 2026" };

export default async function TeamsPage(props: PageProps<"/teams">) {
  const { pool } = await props.searchParams;
  const poolId = resolvePool(pool);
  const points = teamPointsMap();
  const poolTeams = teams.filter((t) => t.poolId === poolId);

  return (
    <main>
      <h1 className="mb-6 text-3xl font-bold">Teams</h1>

      <PoolTabs basePath="/teams" active={poolId} />

      {poolTeams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-6 text-center text-zinc-400">
          No teams in this pool yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {poolTeams.map((team) => {
            const captain = team.captainId
              ? playerById.get(team.captainId)
              : undefined;
            return (
              <Link
                key={team.id}
                href={`/team/${team.id}`}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-emerald-500/50 hover:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{team.name}</span>
                  <span className="text-sm text-zinc-400">
                    {points.get(team.id) ?? 0} pts
                  </span>
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  {team.squad.length > 0
                    ? `${team.squad.length} players`
                    : "Squad not drafted yet"}
                  {captain && ` · C: ${captain.name}`}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
