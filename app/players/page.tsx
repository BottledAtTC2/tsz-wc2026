import type { Metadata } from "next";
import Link from "next/link";
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
const POSITION_COLOR: Record<Position, string> = {
  GK: "bg-accent/20 text-accent",
  DEF: "bg-brand/20 text-brand",
  MID: "bg-sky-400/20 text-sky-300",
  FWD: "bg-orange-400/20 text-orange-300",
};

export default function PlayersPage() {
  const points = playerPointsMap();

  return (
    <main>
      <h1 className="mb-1 text-3xl font-extrabold tracking-tight">Players</h1>
      <p className="mb-5 text-sm text-muted">
        Every drafted player and their fantasy points. Each player belongs to
        one team.
      </p>

      {players.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge bg-panel/40 p-6 text-center text-muted">
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
            <section key={pos} className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${POSITION_COLOR[pos]}`}
                >
                  {pos}
                </span>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                  {POSITION_LABEL[pos]}
                </h2>
              </div>
              <div className="overflow-hidden rounded-xl border border-edge">
                {group.map((p, i) => {
                  const owner = teamForPlayer(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between gap-3 bg-panel/40 px-4 py-3 ${
                        i > 0 ? "border-t border-edge" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{p.name}</div>
                        <div className="truncate text-xs text-muted">
                          {p.country}
                          {p.club && ` · ${p.club}`}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {owner && (
                          <Link
                            href={`/team/${owner.id}`}
                            className="rounded-full bg-panel2 px-2.5 py-1 text-xs text-muted hover:text-ink"
                          >
                            {owner.name}
                          </Link>
                        )}
                        <span className="w-12 text-right text-lg font-bold tabular-nums">
                          {points.get(p.id) ?? 0}
                        </span>
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
