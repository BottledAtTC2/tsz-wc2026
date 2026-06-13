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
    <main className="font-sans">
      {/* Heavy sports-style typography for headers */}
      <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter text-ink">
        Teams
      </h1>
      <p className="mb-6 text-[15px] font-bold uppercase tracking-wider text-muted">
        Tap a team to see its squad.
      </p>

      <PoolTabs basePath="/teams" active={poolId} />

      {poolTeams.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-edge bg-panel p-8 text-center font-bold text-muted">
          NO TEAMS IN THIS POOL YET.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {poolTeams.map((team) => {
            const captain = team.captainId
              ? playerById.get(team.captainId)
              : undefined;
            return (
              <Link
                key={team.id}
                href={`/team/${team.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-panel p-5 shadow-lg transition-all hover:-translate-y-1 hover:bg-panel2"
              >
                {/* Top Section: Team Name & Points */}
                <div className="flex items-start justify-between border-b border-edge pb-4">
                  <span className="pr-2 text-[17px] font-black uppercase leading-tight tracking-tight text-ink transition-colors group-hover:text-brand">
                    {team.name}
                  </span>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                      Total Pts
                    </span>
                    <span className="text-2xl font-black tabular-nums text-ink">
                      {points.get(team.id) ?? 0}
                    </span>
                  </div>
                </div>

                {/* Bottom Section: Squad Meta Data */}
                <div className="mt-4 flex items-center justify-between text-[12px] font-bold uppercase tracking-wide text-muted">
                  <span>
                    {team.squad.length > 0
                      ? `${team.squad.length} Players`
                      : "Squad not drafted"}
                  </span>
                  {captain && (
                    <span className="flex items-center gap-1 rounded-sm bg-panel2 px-2 py-1 transition-colors group-hover:bg-panel">
                      <span className="text-muted">C:</span>
                      <span className="text-brand">{captain.name}</span>
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}