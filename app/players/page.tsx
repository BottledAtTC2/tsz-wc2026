import type { Metadata } from "next";
import { players } from "../data/players";
import { teamForPlayer } from "../lib/lookups";
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

export default function PlayersPage() {
  const points = playerPointsMap();
  return (
    <main>
      <h1 className="mb-6 text-3xl font-bold">Players</h1>

      {players.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-6 text-center text-zinc-400">
          No players loaded yet. They&apos;ll appear here once the draft data is
          added.
        </div>
      ) : (
        POSITION_ORDER.map((pos) => {
          const group = players
            .filter((p) => p.position === pos)
            .sort((a, b) => a.name.localeCompare(b.name));
          if (group.length === 0) return null;
          return (
            <section key={pos} className="mb-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {POSITION_LABEL[pos]}{" "}
                <span className="text-zinc-600">({group.length})</span>
              </h2>
              <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800">
                {group.map((p) => {
                  const owner = teamForPlayer(p.id);
                  return (
                    <li
                      key={p.id}
                      className="flex items-center justify-between bg-zinc-900/30 px-4 py-3"
                    >
                      <div>
                        <span className="font-medium">{p.name}</span>
                        <div className="text-xs text-zinc-500">
                          {p.country}
                          {p.club && ` · ${p.club}`}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {owner && (
                          <span className="text-xs text-zinc-500">
                            {owner.name}
                          </span>
                        )}
                        <span className="w-10 text-right font-semibold tabular-nums">
                          {points.get(p.id) ?? 0}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}
    </main>
  );
}
