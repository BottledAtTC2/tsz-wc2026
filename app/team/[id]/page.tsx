import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { teams } from "../../data/teams";
import {
  loadScores,
  teamPointsMap,
  teamPlayerBreakdowns,
} from "../../lib/scores";
import { roleForPlayerInEvent } from "../../lib/replacements";
import {
  latestScoredEventId,
  rosterDisplayPlayers,
} from "../../lib/rosterDisplay";

export const metadata: Metadata = { title: "Team Squad — TSZ WC 2026" };

// Reads computed points from disk on every request so the page reflects
// newly ingested matches without needing a rebuild.
export const dynamic = "force-dynamic";

// Colour map for the nations our drafted players actually belong to.
const COUNTRY_COLORS: Record<string, { bg: string; text: string }> = {
  Argentina: { bg: "bg-[#43A1D5]", text: "text-black" },
  Austria: { bg: "bg-[#ED2939]", text: "text-white" },
  Belgium: { bg: "bg-[#E30613]", text: "text-[#FDDA24]" },
  Brazil: { bg: "bg-[#FFFE00]", text: "text-[#002776]" },
  Canada: { bg: "bg-[#FF0000]", text: "text-white" },
  Colombia: { bg: "bg-[#FCD116]", text: "text-[#003893]" },
  Croatia: { bg: "bg-[#ED1C24]", text: "text-white" },
  Czechia: { bg: "bg-[#11457E]", text: "text-white" },
  Ecuador: { bg: "bg-[#FFD100]", text: "text-[#001489]" },
  Egypt: { bg: "bg-[#CE1126]", text: "text-white" },
  England: { bg: "bg-[#FAFAFA]", text: "text-[#00145A]" },
  France: { bg: "bg-[#002395]", text: "text-white" },
  Germany: { bg: "bg-white", text: "text-black" },
  Mexico: { bg: "bg-[#006847]", text: "text-white" },
  Morocco: { bg: "bg-[#C1272D]", text: "text-white" },
  Netherlands: { bg: "bg-[#F36C21]", text: "text-black" },
  Norway: { bg: "bg-[#BA0C2F]", text: "text-white" },
  Portugal: { bg: "bg-[#E42518]", text: "text-[#F1BF00]" },
  Scotland: { bg: "bg-[#0065BF]", text: "text-white" },
  Senegal: { bg: "bg-[#00853F]", text: "text-white" },
  "South Korea": { bg: "bg-[#C21A30]", text: "text-white" },
  Spain: { bg: "bg-[#AA151B]", text: "text-[#F1BF00]" },
  Switzerland: { bg: "bg-[#FF0000]", text: "text-white" },
  Turkey: { bg: "bg-[#E30A17]", text: "text-white" },
  USA: { bg: "bg-[#002868]", text: "text-white" },
  Uruguay: { bg: "bg-[#7BCAE6]", text: "text-black" },

  // Fallback for any nation not listed above.
  DEFAULT: { bg: "bg-panel2", text: "text-ink" },
};

export default async function TeamPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const store = loadScores();
  const pointsMap = teamPointsMap(store);

  const team = teams.find((t) => t.id === id);
  if (!team) return notFound();

  // Load full player objects and sort them by position logically.
  const posOrder = { GK: 1, DEF: 2, MID: 3, FWD: 4 };
  const squad = rosterDisplayPlayers(team);
  squad.sort(
    (a, b) =>
      posOrder[a.player.position as keyof typeof posOrder] -
        posOrder[b.player.position as keyof typeof posOrder] ||
      team.squad.indexOf(a.originalId) - team.squad.indexOf(b.originalId) ||
      Number(Boolean(a.replacementFor)) - Number(Boolean(b.replacementFor)),
  );

  const totalPoints = pointsMap.get(team.id) ?? 0;
  // Real per-player season breakdowns for this team.
  const breakdowns = teamPlayerBreakdowns(team.id, store);
  const latestEventId = latestScoredEventId(store);

  return (
    <main className="font-sans">
      {/* Header Section */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link
            href="/teams"
            className="mb-4 inline-block text-[13px] font-black uppercase tracking-widest text-muted hover:text-ink"
          >
            ← Back to Teams
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
            {totalPoints}
          </span>
        </div>
      </div>

      {/* The Legend UI */}
      <div className="mb-4 flex items-center gap-6 rounded-lg border border-edge bg-panel/50 px-4 py-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-muted">
          Legend:
        </span>
        <div className="flex items-center gap-2">
          <span className="h-3 w-4 rounded-sm border-2 border-amber-400 bg-amber-400/20"></span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-ink">
            Captain
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-4 rounded-sm border-2 border-slate-300 bg-slate-300/20"></span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-ink">
            Vice-Captain
          </span>
        </div>
      </div>

      {/* Grid of Player Stat Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {squad.map(({ player, replacementFor, replacedBy }) => {
          const isInjured = Boolean(replacedBy);
          const isReplacement = Boolean(replacementFor);
          const displayRole = latestEventId
            ? roleForPlayerInEvent(team, player.id, latestEventId)
            : player.id === team.captainId
              ? "captain"
              : player.id === team.viceCaptainId
                ? "vice"
                : "none";
          const isCaptain = displayRole === "captain";
          const isVice = displayRole === "vice";
          const kit =
            COUNTRY_COLORS[player.country] || COUNTRY_COLORS["DEFAULT"];

          // Captain = gold border, vice = silver border, otherwise default.
          const borderStyle = isCaptain
            ? "border-[3px] border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
            : isVice
              ? "border-[3px] border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.1)]"
              : isReplacement
                ? "border-[3px] border-accent shadow-[0_0_15px_rgba(0,166,80,0.16)]"
                : isInjured
                  ? "border-[3px] border-red-200/50"
                  : "border border-edge hover:border-brand/50";

          // Real points breakdown for this player on this team.
          const breakdown = breakdowns.get(player.id);
          const stats = (breakdown?.lines ?? []).map((l) => ({
            label: l.label,
            pts: l.points,
            negative: l.points < 0,
          }));
          const playerTotalPts = breakdown?.total ?? 0;

          return (
            <div
              key={`${player.id}-${replacementFor?.id ?? "original"}`}
              className={`flex flex-col overflow-hidden rounded-xl bg-panel transition-colors ${
                isInjured ? "bg-panel/55 opacity-65" : ""
              } ${borderStyle}`}
            >
              {/* Card Header (Color Coded by Country) */}
              <div
                className={`flex flex-col justify-center border-b border-edge px-5 py-4 ${
                  isInjured ? "grayscale" : ""
                } ${kit.bg} ${kit.text}`}
              >
                <div className="text-xl font-black uppercase tracking-tight">
                  {player.name}
                </div>
                <div className="mt-0.5 text-[11px] font-bold uppercase tracking-widest opacity-80">
                  {player.position} / {player.country}
                </div>
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

              {/* Stats Breakdown Body */}
              <div className="flex flex-1 flex-col gap-1 bg-panel p-4">
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted">
                  Point Breakdown
                </div>

                {stats.length === 0 ? (
                  <div className="text-sm font-bold text-muted">
                    No points yet.
                  </div>
                ) : (
                  stats.map((stat, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-edge/40 pb-1.5 pt-1 text-[13px] font-bold"
                    >
                      <span className="text-ink">{stat.label}</span>
                      <span
                        className={`tabular-nums ${stat.negative ? "text-red-500" : "text-brand"}`}
                      >
                        {stat.pts > 0 ? `+${stat.pts}` : stat.pts}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Card Footer (Total Points) */}
              <div className="flex items-center justify-between border-t border-edge bg-panel2 px-5 py-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-muted">
                  Total
                </span>
                <span className="text-2xl font-black tabular-nums text-brand">
                  {playerTotalPts}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
