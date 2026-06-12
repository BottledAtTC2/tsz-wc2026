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
      <h1 className="mb-1 text-3xl font-extrabold tracking-tight">Teams</h1>
      <p className="mb-5 text-sm text-muted">Tap a team to see its squad.</p>

      <PoolTabs basePath="/teams" active={poolId} />

      {poolTeams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge bg-panel/40 p-6 text-center text-muted">
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
                className="rounded-xl border border-edge bg-panel/50 p-4 transition-colors hover:border-brand/60 hover:bg-panel"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{team.name}</span>
                  <span className="text-sm font-bold tabular-nums text-brand">
                    {points.get(team.id) ?? 0}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted">
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
