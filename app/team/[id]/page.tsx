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
      <Link href="/teams" className="text-sm text-muted hover:text-ink">
        ← All teams
      </Link>

      <div className="mt-3 mb-6 flex items-end justify-between gap-4 rounded-2xl border border-edge bg-gradient-to-br from-panel2 to-panel p-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{team.name}</h1>
          <p className="text-sm text-muted">{poolName(team.poolId)}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-brand">{teamPts}</div>
          <div className="text-xs text-muted">points</div>
        </div>
      </div>

      {squad.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge bg-panel/40 p-6 text-center text-muted">
          <p>Squad not drafted yet.</p>
          {(team.captainName || team.viceCaptainName) && (
            <p className="mt-2 text-sm text-muted">
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
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {POSITION_LABEL[pos]}
              </h2>
              <ul className="divide-y divide-edge overflow-hidden rounded-xl border border-edge">
                {group.map((p) => {
                  const isCaptain = p.id === team.captainId;
                  const isVice = p.id === team.viceCaptainId;
                  return (
                    <li
                      key={p.id}
                      className="flex items-center justify-between bg-panel/40 px-4 py-3"
                    >
                      <div>
                        <span className="font-medium">{p.name}</span>
                        {isCaptain && (
                          <span className="ml-2 rounded bg-brand/20 px-1.5 py-0.5 text-xs font-bold text-brand">
                            C
                          </span>
                        )}
                        {isVice && (
                          <span className="ml-2 rounded bg-accent/20 px-1.5 py-0.5 text-xs font-bold text-accent">
                            VC
                          </span>
                        )}
                        <div className="text-xs text-muted">
                          {p.country}
                          {p.club && ` · ${p.club}`}
                        </div>
                      </div>
                      <span className="text-lg font-bold tabular-nums">
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
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Match breakdown
          </h2>
          <div className="space-y-3">
            {breakdown.map(({ match, contributions }) => {
              const matchTotal = contributions.reduce((s, c) => s + c.total, 0);
              return (
                <div
                  key={match.eventId}
                  className="overflow-hidden rounded-xl border border-edge"
                >
                  <div className="flex items-center justify-between bg-panel2 px-4 py-2 text-sm">
                    <span>
                      {match.home}{" "}
                      <span className="text-muted">
                        {match.homeScore ?? "-"}–{match.awayScore ?? "-"}
                      </span>{" "}
                      {match.away}
                    </span>
                    <span className="font-bold text-brand">+{matchTotal}</span>
                  </div>
                  <ul className="divide-y divide-edge">
                    {contributions
                      .sort((a, b) => b.total - a.total)
                      .map((c) => (
                        <li
                          key={c.playerId}
                          className="flex items-center justify-between bg-panel/40 px-4 py-2 text-sm"
                        >
                          <span>
                            {c.name}
                            {c.role === "captain" && (
                              <span className="ml-2 text-xs font-bold text-brand">
                                C ×{c.multiplier}
                              </span>
                            )}
                            {c.role === "vice" && (
                              <span className="ml-2 text-xs font-bold text-accent">
                                VC ×{c.multiplier}
                              </span>
                            )}
                          </span>
                          <span className="font-semibold tabular-nums">
                            {c.total}
                          </span>
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
