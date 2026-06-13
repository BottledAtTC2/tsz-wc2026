import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { teams } from "../../data/teams";
import { playerById } from "../../data/players";
import {
  loadScores,
  teamPointsMap,
  teamPlayerBreakdowns,
} from "../../lib/scores";

export const metadata: Metadata = { title: "Team Squad — TSZ WC 2026" };

// The 48-Team Color Map (Used for Card Headers now instead of jerseys)
const COUNTRY_COLORS: Record<string, { bg: string; text: string }> = {
  // Hosts
  England: { bg: "bg-[#FAFAFA]", text: "text-[#00145A]" },
  USA: { bg: "bg-[#002868]", text: "text-white" },
  Mexico: { bg: "bg-[#006847]", text: "text-white" },
  Canada: { bg: "bg-[#FF0000]", text: "text-white" },

  // South America
  Argentina: { bg: "bg-[#43A1D5]", text: "text-black" },
  Brazil: { bg: "bg-[#FFFE00]", text: "text-[#002776]" },
  Uruguay: { bg: "bg-[#7BCAE6]", text: "text-black" },
  Colombia: { bg: "bg-[#FCD116]", text: "text-[#003893]" },
  Chile: { bg: "bg-[#D52B1E]", text: "text-white" },
  Ecuador: { bg: "bg-[#FFD100]", text: "text-[#001489]" },
  Peru: { bg: "bg-[#D91023]", text: "text-white" },

  // Europe
  France: { bg: "bg-[#002395]", text: "text-white" },
  Spain: { bg: "bg-[#AA151B]", text: "text-[#F1BF00]" },
  Germany: { bg: "bg-white", text: "text-black" },
  Portugal: { bg: "bg-[#E42518]", text: "text-[#F1BF00]" },
  Italy: { bg: "bg-[#0066B2]", text: "text-white" },
  Netherlands: { bg: "bg-[#F36C21]", text: "text-black" },
  Belgium: { bg: "bg-[#E30613]", text: "text-[#FDDA24]" },
  Croatia: { bg: "bg-[#ED1C24]", text: "text-white" },
  Switzerland: { bg: "bg-[#FF0000]", text: "text-white" },
  Denmark: { bg: "bg-[#C60C30]", text: "text-white" },
  Sweden: { bg: "bg-[#FECC00]", text: "text-[#006AA7]" },
  Poland: { bg: "bg-[#DC143C]", text: "text-white" },
  Serbia: { bg: "bg-[#C6363C]", text: "text-white" },
  Austria: { bg: "bg-[#ED2939]", text: "text-white" },
  Ukraine: { bg: "bg-[#FFD700]", text: "text-[#0057B7]" },

  // Africa
  Morocco: { bg: "bg-[#C1272D]", text: "text-white" },
  Senegal: { bg: "bg-[#00853F]", text: "text-white" },
  Nigeria: { bg: "bg-[#008751]", text: "text-white" },
  Egypt: { bg: "bg-[#CE1126]", text: "text-white" },
  Ghana: { bg: "bg-white", text: "text-black" },
  Cameroon: { bg: "bg-[#007A5E]", text: "text-[#FCD116]" },
  "Ivory Coast": { bg: "bg-[#F77F00]", text: "text-white" },
  Algeria: { bg: "bg-[#006233]", text: "text-white" },
  Tunisia: { bg: "bg-[#E70013]", text: "text-white" },

  // Asia & Australia
  Japan: { bg: "bg-[#000555]", text: "text-white" },
  "South Korea": { bg: "bg-[#C21A30]", text: "text-white" },
  Australia: { bg: "bg-[#FFCD00]", text: "text-[#008751]" },
  Iran: { bg: "bg-[#DA0000]", text: "text-white" },
  "Saudi Arabia": { bg: "bg-[#006C35]", text: "text-white" },
  Qatar: { bg: "bg-[#8A1538]", text: "text-white" },
  UAE: { bg: "bg-white", text: "text-[#FF0000]" },
  Uzbekistan: { bg: "bg-[#0099B5]", text: "text-white" },

  // CONCACAF
  "Costa Rica": { bg: "bg-[#CE1126]", text: "text-white" },
  Panama: { bg: "bg-[#DA291C]", text: "text-white" },
  Jamaica: { bg: "bg-[#FED100]", text: "text-[#009B3A]" },

  // OFC
  "New Zealand": { bg: "bg-white", text: "text-black" },
  Fiji: { bg: "bg-white", text: "text-black" },

  // Fallback
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

  // Load full player objects and sort them by position logically
  const posOrder = { GK: 1, DEF: 2, MID: 3, FWD: 4 };
  const squad = team.squad
    .map((playerId) => playerById.get(playerId))
    .filter(Boolean) as NonNullable<ReturnType<typeof playerById.get>>[];

  squad.sort(
    (a, b) =>
      posOrder[a.position as keyof typeof posOrder] -
      posOrder[b.position as keyof typeof posOrder],
  );

  const totalPoints = pointsMap.get(team.id) ?? 0;
  // Real per-player season breakdowns for this team.
  const breakdowns = teamPlayerBreakdowns(team.id, store);

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

      {/* Grid of Player Stat Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {squad.map((player) => {
          const isCaptain = team.captainId === player.id;
          const isVice = team.viceCaptainId === player.id;
          const kit =
            COUNTRY_COLORS[player.country] || COUNTRY_COLORS["DEFAULT"];

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
              key={player.id}
              className="flex flex-col overflow-hidden rounded-xl border border-edge bg-panel shadow-lg transition-colors hover:border-brand/50"
            >
              {/* Card Header (Color Coded by Country) */}
              <div
                className={`relative flex flex-col justify-center border-b border-edge px-5 py-4 ${kit.bg} ${kit.text}`}
              >
                <div className="text-xl font-black uppercase tracking-tight">
                  {player.name}
                </div>
                <div className="mt-0.5 text-[11px] font-bold uppercase tracking-widest opacity-80">
                  {player.position} // {player.country}
                </div>

                {/* C/VC Badge floating on the right */}
                {(isCaptain || isVice) && (
                  <span className="absolute right-4 top-1/2 flex h-[28px] w-[28px] -translate-y-1/2 items-center justify-center rounded-full border-2 border-brand bg-panel text-[14px] font-black text-brand shadow-md">
                    {isCaptain ? "C" : "V"}
                  </span>
                )}
              </div>

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
