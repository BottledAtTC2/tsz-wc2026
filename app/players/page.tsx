import type { Metadata } from "next";
import Link from "next/link";
import { players } from "../data/players";
import { teamsForPlayer } from "../lib/lookups";
import { playerPointsMap } from "../lib/scores";
import type { Position } from "../data/types";

export const metadata: Metadata = { title: "Players — TSZ WC 2026" };

// Reads computed points from disk, so render per request.
export const dynamic = "force-dynamic";

const POSITION_ORDER: Position[] = ["GK", "DEF", "MID", "FWD"];
const POSITION_LABEL: Record<Position, string> = {
  GK: "Goalkeepers",
  DEF: "Defenders",
  MID: "Midfielders",
  FWD: "Forwards",
};

// Upgraded to high-contrast solid colors for immediate visual scanning
const POSITION_COLOR: Record<Position, string> = {
  GK: "bg-accent text-ink",        // Solid green, white text
  DEF: "bg-brand text-black",      // Solid neon lime, black text
  MID: "bg-blue-600 text-white",   // Standard blue, white text
  FWD: "bg-orange-500 text-white", // Standard orange, white text
};

export default function PlayersPage() {
  const points = playerPointsMap();

  return (
    <main className="font-sans">
      <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter text-ink md:text-5xl">
        Players
      </h1>
      <p className="mb-8 max-w-2xl text-[15px] font-bold uppercase tracking-widest text-muted">
        Every drafted player and their fantasy points. Each player belongs to one team.
      </p>

      {players.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-edge bg-panel p-8 text-center font-bold text-muted uppercase">
          No players loaded yet.
        </div>
      ) : (
        POSITION_ORDER.map((pos) => {
          const group = players
            .filter((p) => p.position === pos)
            .sort(
              (a, b) =>
                (points.get(b.id) ?? 0) - (points.get(a.id) ?? 0) ||
                a.name.localeCompare(b.name),
            );
          if (group.length === 0) return null;
          return (
            <section key={pos} className="mb-10">
              {/* High-impact positional section header */}
              <div className="mb-3 flex items-center gap-3 border-b-2 border-edge pb-2">
                <span
                  className={`flex h-8 items-center justify-center rounded-sm px-3 text-[13px] font-black uppercase tracking-wider shadow-sm ${POSITION_COLOR[pos]}`}
                >
                  {pos}
                </span>
                <h2 className="text-xl font-black uppercase tracking-wide text-ink">
                  {POSITION_LABEL[pos]}
                </h2>
              </div>
              
              {/* Player List Container */}
              <div className="overflow-hidden rounded-xl bg-panel shadow-lg">
                {group.map((p, i) => {
                  const owners = teamsForPlayer(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`group flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-panel2 ${
                        i > 0 ? "border-t border-edge" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[16px] font-black uppercase text-ink transition-colors group-hover:text-brand">
                          {p.name}
                        </div>
                        <div className="truncate text-[11px] font-bold uppercase tracking-widest text-muted mt-0.5">
                          {p.country}
                          {p.club && <span className="opacity-50"> // {p.club}</span>}
                        </div>
                      </div>
                      
                      <div className="flex shrink-0 items-center gap-3 md:gap-6">
                        {/* Team Owner Badge(s) */}
                        <div className="flex gap-1">
                          {owners.map((owner) => (
                            <Link
                              key={owner.id}
                              href={`/team/${owner.id}`}
                              className="hidden rounded-sm bg-panel2 border border-edge px-2 py-1 text-[10px] font-black uppercase tracking-widest text-muted transition-colors hover:border-brand hover:text-brand sm:inline-block"
                            >
                              {owner.name}
                            </Link>
                          ))}
                        </div>
                        
                        {/* Points Display */}
                        <div className="flex w-16 flex-col items-end">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted md:hidden">
                            Pts
                          </span>
                          <span className="text-xl font-black tabular-nums text-ink md:text-2xl">
                            {points.get(p.id) ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}
