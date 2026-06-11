import { notFound } from "next/navigation";
import Link from "next/link";
import { teamById } from "../../data/teams";
import { playerById } from "../../data/players";
import { poolName } from "../../lib/lookups";
import { teamPointsMap, playerPointsMap, teamBreakdown } from "../../lib/scores";
import type { Position } from "../../data/types";

const POSITION_ORDER: Position[] = ["GK", "DEF", "MID", "FWD"];
const POSITION_LABEL: Record<Position, string> = {
  GK: "Goalkeepers",
  DEF: "Defenders",
  MID: "Midfielders",
  FWD: "Forwards",
};

export async function generateMetadata(props: PageProps<"/team/[id]">) {
  const { id } = await props.params;
  const team = teamById.get(id);
  return { title: team ? `${team.name} — TSZ WC 2026` : "Team — TSZ WC 2026" };
}

export default async function TeamPage(props: PageProps<"/team/[id]">) {
  const { id } = await props.params;
  const team = teamById.get(id);
  if (!team) notFound();

  const squad = team.squad
    .map((pid) => playerById.get(pid))
    .filter((p) => p !== undefined);

  const teamPts = teamPointsMap().get(team.id) ?? 0;
  const playerPts = playerPointsMap();
  const breakdown = teamBreakdown(team.id);

  return (
    <main>
      <Link
        href="/teams"
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← All teams
      </Link>

      <div className="mt-3 mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-sm text-zinc-500">{poolName(team.poolId)}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-400">{teamPts}</div>
          <div className="text-xs text-zinc-500">points</div>
        </div>
      </div>

      {squad.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-6 text-center text-zinc-400">
          <p>Squad not drafted yet.</p>
          {(team.captainName || team.viceCaptainName) && (
            <p className="mt-2 text-sm text-zinc-500">
              Preliminary picks
              {team.captainName && ` · Captain: ${team.captainName}`}
              {team.viceCaptainName && ` · Vice: ${team.viceCaptainName}`}
            </p>
          )}
        </div>
      ) : (
        POSITION_ORDER.map((pos) => {
          const group = squad.filter((p) => p.position === pos);
          if (group.length === 0) return null;
          return (
            <section key={pos} className="mb-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {POSITION_LABEL[pos]}
              </h2>
              <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800">
                {group.map((p) => {
                  const isCaptain = p.id === team.captainId;
                  const isVice = p.id === team.viceCaptainId;
                  return (
                    <li
                      key={p.id}
                      className="flex items-center justify-between bg-zinc-900/30 px-4 py-3"
                    >
                      <div>
                        <span className="font-medium">{p.name}</span>
                        {isCaptain && (
                          <span className="ml-2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs text-emerald-300">
                            C
                          </span>
                        )}
                        {isVice && (
                          <span className="ml-2 rounded bg-sky-500/15 px-1.5 py-0.5 text-xs text-sky-300">
                            VC
                          </span>
                        )}
                        <div className="text-xs text-zinc-500">
                          {p.country}
                          {p.club && ` · ${p.club}`}
                        </div>
                      </div>
                      <span className="font-semibold tabular-nums">
                        {playerPts.get(p.id) ?? 0}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}

      {breakdown.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Match breakdown
          </h2>
          <div className="space-y-3">
            {breakdown.map(({ match, contributions }) => {
              const matchTotal = contributions.reduce((s, c) => s + c.total, 0);
              return (
                <div
                  key={match.eventId}
                  className="overflow-hidden rounded-xl border border-zinc-800"
                >
                  <div className="flex items-center justify-between bg-zinc-900 px-4 py-2 text-sm">
                    <span>
                      {match.home}{" "}
                      <span className="text-zinc-500">
                        {match.homeScore ?? "-"}–{match.awayScore ?? "-"}
                      </span>{" "}
                      {match.away}
                    </span>
                    <span className="font-semibold text-emerald-400">
                      +{matchTotal}
                    </span>
                  </div>
                  <ul className="divide-y divide-zinc-800">
                    {contributions
                      .sort((a, b) => b.total - a.total)
                      .map((c) => (
                        <li
                          key={c.playerId}
                          className="flex items-center justify-between bg-zinc-900/30 px-4 py-2 text-sm"
                        >
                          <span>
                            {c.name}
                            {c.role === "captain" && (
                              <span className="ml-2 text-xs text-emerald-300">
                                C ×{c.multiplier}
                              </span>
                            )}
                            {c.role === "vice" && (
                              <span className="ml-2 text-xs text-sky-300">
                                VC ×{c.multiplier}
                              </span>
                            )}
                          </span>
                          <span className="tabular-nums">{c.total}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
