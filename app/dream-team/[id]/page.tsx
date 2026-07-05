import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dreamTeamById } from "../../data/dream-teams";
import {
  loadScores,
  rosterPlayerBreakdowns,
  rosterSlotTotals,
} from "../../lib/scores";
import {
  latestScoredEventId,
  rosterDisplayPlayers,
} from "../../lib/rosterDisplay";
import { colorsFor } from "../../lib/countryColors";
import { roleForPlayerInEvent } from "../../lib/replacements";

export const metadata: Metadata = { title: "Dream Team — TSZ WC 2026" };

export const dynamic = "force-dynamic";

const posOrder = { GK: 1, DEF: 2, MID: 3, FWD: 4 } as const;

export default async function DreamTeamView(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const team = dreamTeamById.get(id);
  if (!team) return notFound();

  const store = loadScores();
  const breakdowns = rosterPlayerBreakdowns(team, store);
  const slotTotals = rosterSlotTotals(team, store);
  const latestEventId = latestScoredEventId(store);

  const squad = rosterDisplayPlayers(team);
  squad.sort(
    (a, b) =>
      posOrder[a.player.position as keyof typeof posOrder] -
        posOrder[b.player.position as keyof typeof posOrder] ||
      team.squad.indexOf(a.originalId) - team.squad.indexOf(b.originalId) ||
      Number(Boolean(a.replacementFor)) - Number(Boolean(b.replacementFor)),
  );

  const sortedTotals = team.squad
    .map((pid) => slotTotals.get(pid) ?? 0)
    .sort((a, b) => b - a);
  const countedTotals =
    team.countTop != null ? sortedTotals.slice(0, team.countTop) : sortedTotals;
  const total = countedTotals.reduce((s, pts) => s + pts, 0);

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
        {squad.map(({ player, replacementFor, replacedBy }) => {
          const kit = colorsFor(player.country);
          const isInjured = Boolean(replacedBy);
          const isReplacement = Boolean(replacementFor);
          const displayRole = latestEventId
            ? roleForPlayerInEvent(team, player.id, latestEventId)
            : player.id === team.captainId
              ? "captain"
              : player.id === team.viceCaptainId
                ? "vice"
                : "none";
          const isC = displayRole === "captain";
          const isVc = displayRole === "vice";
          const b = breakdowns.get(player.id);
          const lines = (b?.lines ?? []).map((l) => ({
            label: l.label,
            pts: l.points,
          }));
          const playerTotal = b?.total ?? 0;

          return (
            <div
              key={`${player.id}-${replacementFor?.id ?? "original"}`}
              className={`flex flex-col overflow-hidden rounded-xl bg-panel shadow-lg ${
                isReplacement
                  ? "border-[3px] border-accent"
                  : isInjured
                    ? "border-[3px] border-red-200/50 opacity-65"
                    : "border border-edge"
              }`}
            >
              <div
                className={`relative flex flex-col justify-center border-b border-edge px-5 py-4 ${
                  isInjured ? "grayscale" : ""
                } ${kit.bg} ${kit.text}`}
              >
                <div className="text-xl font-black uppercase tracking-tight">
                  {player.name}
                </div>
                <div className="mt-0.5 text-[11px] font-bold uppercase tracking-widest opacity-80">
                  {player.position} / {player.country}
                </div>
                {(isC || isVc) && (
                  <span className="absolute right-4 top-1/2 flex h-[28px] w-[28px] -translate-y-1/2 items-center justify-center rounded-full border-2 border-brand bg-panel text-[14px] font-black text-brand shadow-md">
                    {isC ? "C" : "V"}
                  </span>
                )}
              </div>

              {(isReplacement || isInjured) && (
                <div
                  className={`border-b border-edge px-4 py-3 ${
                    isReplacement
                      ? "bg-brand text-black"
                      : "bg-white text-red-950"
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-70">
                    {isReplacement ? "Replacement Alert" : "Player Status"}
                  </div>
                  <div className="mt-1 text-[13px] font-black uppercase tracking-widest">
                    {isReplacement
                      ? `Replaces ${replacementFor?.name}`
                      : "Injured / Ruled Out"}
                  </div>
                </div>
              )}

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
