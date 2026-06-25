import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dreamTeamById } from "../../data/dream-teams";
import { playerById } from "../../data/players";
import { playerBreakdowns } from "../../lib/scores";
import { colorsFor } from "../../lib/countryColors";
import { SCORING } from "../../lib/scoring";

export const metadata: Metadata = { title: "Dream Team — TSZ WC 2026" };

export const dynamic = "force-dynamic";

const posOrder = { GK: 1, DEF: 2, MID: 3, FWD: 4 } as const;

export default async function DreamTeamView(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const team = dreamTeamById.get(id);
  if (!team) return notFound();

  const breakdowns = playerBreakdowns();

  const squad = team.squad
    .map((pid) => playerById.get(pid))
    .filter(Boolean) as NonNullable<ReturnType<typeof playerById.get>>[];
  squad.sort(
    (a, b) =>
      posOrder[a.position as keyof typeof posOrder] -
      posOrder[b.position as keyof typeof posOrder],
  );

  const mult = (pid: string) =>
    pid === team.captainId
      ? SCORING.captainMultiplier
      : pid === team.viceCaptainId
        ? SCORING.viceCaptainMultiplier
        : 1;

  const total = team.squad.reduce(
    (s, pid) => s + (breakdowns.get(pid)?.total ?? 0) * mult(pid),
    0,
  );

  return (
    <main className="font-sans">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link
            href="/dream-team"
            className="mb-4 inline-block text-[13px] font-black uppercase tracking-widest text-muted hover:text-ink"
          >
            ← Dream Team
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-ink md:text-5xl">
            {team.name}
          </h1>
        </div>
        <div className="flex shrink-0 flex-col rounded-xl border border-edge bg-panel p-4 text-right shadow-sm">
          <span className="text-[11px] font-black uppercase tracking-widest text-muted">
            Total Pts
          </span>
          <span className="text-4xl font-black tabular-nums text-brand">
            {Math.round(total * 10) / 10}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {squad.map((player) => {
          const kit = colorsFor(player.country);
          const isC = player.id === team.captainId;
          const isVc = player.id === team.viceCaptainId;
          const b = breakdowns.get(player.id);
          const m = mult(player.id);
          const lines = (b?.lines ?? []).map((l) => ({
            label: l.label,
            pts: l.points * m,
          }));
          const playerTotal = (b?.total ?? 0) * m;

          return (
            <div
              key={player.id}
              className="flex flex-col overflow-hidden rounded-xl border border-edge bg-panel shadow-lg"
            >
              <div
                className={`relative flex flex-col justify-center border-b border-edge px-5 py-4 ${kit.bg} ${kit.text}`}
              >
                <div className="text-xl font-black uppercase tracking-tight">
                  {player.name}
                </div>
                <div className="mt-0.5 text-[11px] font-bold uppercase tracking-widest opacity-80">
                  {player.position} // {player.country}
                </div>
                {(isC || isVc) && (
                  <span className="absolute right-4 top-1/2 flex h-[28px] w-[28px] -translate-y-1/2 items-center justify-center rounded-full border-2 border-brand bg-panel text-[14px] font-black text-brand shadow-md">
                    {isC ? "C" : "V"}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-1 bg-panel p-4">
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted">
                  Point Breakdown
                </div>
                {lines.length === 0 ? (
                  <div className="text-sm font-bold text-muted">
                    No points yet.
                  </div>
                ) : (
                  lines.map((stat, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-edge/40 pb-1.5 pt-1 text-[13px] font-bold"
                    >
                      <span className="text-ink">{stat.label}</span>
                      <span
                        className={`tabular-nums ${stat.pts < 0 ? "text-red-500" : "text-brand"}`}
                      >
                        {stat.pts > 0 ? `+${stat.pts}` : stat.pts}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between border-t border-edge bg-panel2 px-5 py-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-muted">
                  Total
                </span>
                <span className="text-2xl font-black tabular-nums text-brand">
                  {Math.round(playerTotal * 10) / 10}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
