import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { teams } from "../../data/teams";
import { playerById } from "../../data/players";
import { teamBreakdown, loadScores, teamPointsMap } from "../../lib/scores";

export const metadata: Metadata = { title: "Team Squad — TSZ WC 2026" };

// Assuming standard Next.js dynamic route params
export default async function TeamPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const store = loadScores();
  const pointsMap = teamPointsMap(store);
  
  const team = teams.find((t) => t.id === id);
  if (!team) return notFound();

  // Map squad IDs to full player objects
  const squad = team.squad
    .map((playerId) => playerById.get(playerId))
    .filter(Boolean) as any[]; // Type cast as fallback, adjust to your actual Player type

  // Group players by position for the pitch layout
  const positions = ["GK", "DEF", "MID", "FWD"];
  const groupedSquad = positions.map((pos) => ({
    pos,
    players: squad.filter((p) => p.position === pos),
  }));

  const totalPoints = pointsMap.get(team.id) ?? 0;
  const breakdowns = teamBreakdown(team.id, store);

  return (
    <main className="font-sans">
      {/* Header Section */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link href="/teams" className="mb-4 inline-block text-sm font-bold text-muted hover:text-ink">
            ← BACK TO TEAMS
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-ink md:text-5xl">
            {team.name}
          </h1>
        </div>
        <div className="flex shrink-0 flex-col rounded-xl bg-panel p-4 text-right shadow-sm border border-edge">
          <span className="text-xs font-black uppercase tracking-widest text-muted">Total Pts</span>
          <span className="text-4xl font-black tabular-nums text-brand">{totalPoints}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left Column: The Tactical Pitch */}
        <div className="flex flex-col rounded-xl border border-edge bg-panel p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between border-b border-edge pb-2">
            <h2 className="text-lg font-black uppercase tracking-wide text-ink">Pitch View</h2>
            <span className="rounded-sm bg-panel2 px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-muted">
              {squad.length} / 11 Players
            </span>
          </div>

          {/* The Pitch Container */}
          <div className="relative flex aspect-[4/5] md:aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-lg bg-[#00A650] bg-gradient-to-b from-[#00A650] to-[#007036] py-6 shadow-inner">
            {/* Pitch Lines (Visual Only) */}
            <div className="pointer-events-none absolute inset-0 m-4 rounded-xl border-2 border-white/20" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-1/6 w-1/2 -translate-x-1/2 border-b-2 border-x-2 border-white/20" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-1/6 w-1/2 -translate-x-1/2 border-x-2 border-t-2 border-white/20" />

            {/* Render Players Row by Row (GK at top, FWD at bottom) */}
            {groupedSquad.map(({ pos, players }) => (
              <div key={pos} className="relative z-10 flex w-full justify-around px-2">
                {players.map((player) => {
                  const isCaptain = team.captainId === player.id;
                  const isVice = team.viceCaptainId === player.id;
                  
                  return (
                    <div key={player.id} className="flex w-[70px] flex-col items-center gap-1 md:w-[90px]">
                      {/* Jersey Graphic Placeholder */}
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-t-md bg-white shadow-md md:h-12 md:w-12">
                        {/* C / VC Badges */}
                        {(isCaptain || isVice) && (
                          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-black text-black shadow-sm border border-black">
                            {isCaptain ? "C" : "V"}
                          </span>
                        )}
                        <span className="text-xs font-black text-black">{pos}</span>
                      </div>
                      
                      {/* Player Name Tag */}
                      <div className="w-full truncate rounded-sm bg-panel px-1 py-0.5 text-center text-[11px] font-bold text-ink shadow-sm md:text-xs">
                        {player.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Match-by-Match Breakdown */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-black uppercase tracking-wide text-ink">Match Breakdown</h2>
          
          {breakdowns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-edge bg-panel/40 p-6 text-center text-sm font-bold text-muted">
              NO MATCH DATA AVAILABLE YET.
            </div>
          ) : (
            breakdowns.map((round, idx) => (
              <div key={idx} className="rounded-xl border border-edge bg-panel p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between border-b border-edge pb-2">
                  <span className="font-black uppercase tracking-wide text-ink">Matchday {idx + 1}</span>
                  <span className="rounded-sm bg-brand px-2 py-0.5 text-xs font-black text-black">
                    +{round.contributions.reduce((sum, c) => sum + c.total, 0)} PTS
                  </span>
                </div>
                
                {/* Round Player List */}
                <div className="flex flex-col gap-2">
                  {round.contributions.map((c, i) => {
                    const p = playerById.get(c.playerId);
                    return (
                      <div key={i} className="flex items-center justify-between rounded bg-panel2 px-3 py-2 text-sm font-bold">
                        <span className="text-ink">{p?.name ?? "Unknown"}</span>
                        <span className="text-brand">{c.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}