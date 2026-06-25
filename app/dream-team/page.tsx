import type { Metadata } from "next";
import Link from "next/link";
import { dreamTeams } from "../data/dream-teams";
import { playerPointsMap } from "../lib/scores";
import { SCORING } from "../lib/scoring";
import type { DreamTeam } from "../data/dream-teams";

export const metadata: Metadata = { title: "Dream Team — TSZ WC 2026" };

export const dynamic = "force-dynamic";

export function dreamTeamTotal(
  team: DreamTeam,
  base: Map<string, number>,
): number {
  const vals = team.squad.map((pid) => {
    const m =
      pid === team.captainId
        ? SCORING.captainMultiplier
        : pid === team.viceCaptainId
          ? SCORING.viceCaptainMultiplier
          : 1;
    return (base.get(pid) ?? 0) * m;
  });
  vals.sort((a, b) => b - a);
  const counted = team.countTop != null ? vals.slice(0, team.countTop) : vals;
  return counted.reduce((s, x) => s + x, 0);
}

export default function DreamTeamPage() {
  const base = playerPointsMap();
  const rows = dreamTeams
    .map((team) => ({ team, total: dreamTeamTotal(team, base) }))
    .sort((a, b) => b.total - a.total);

  return (
    <main className="font-sans">
      <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter text-ink md:text-5xl">
        Dream Team
      </h1>
      <p className="mb-6 text-[15px] font-bold uppercase tracking-widest text-muted">
        Everyone&apos;s dream XI · all 11 count
      </p>

      <div className="overflow-hidden rounded-xl bg-panel shadow-xl">
        <div className="grid grid-cols-[3rem_1fr_4.5rem] items-center gap-3 bg-panel2 px-4 py-4 text-xs font-black uppercase tracking-wider text-muted md:grid-cols-[4rem_1fr_6rem] md:text-sm">
          <span className="text-center">Rank</span>
          <span>Team</span>
          <span className="text-right">Pts</span>
        </div>
        <div className="divide-y divide-edge">
          {rows.map(({ team, total }, i) => (
            <Link
              key={team.id}
              href={`/dream-team/${team.id}`}
              className="grid grid-cols-[3rem_1fr_4.5rem] items-center gap-3 bg-panel px-4 py-3.5 transition-colors hover:bg-panel2 md:grid-cols-[4rem_1fr_6rem]"
            >
              <span
                className={`mx-auto flex h-7 w-7 items-center justify-center rounded-sm text-[13px] font-black shadow-sm md:h-8 md:w-8 md:text-sm ${
                  i === 0
                    ? "bg-brand text-black"
                    : i < 3
                      ? "bg-panel2 text-brand"
                      : "bg-transparent text-muted"
                }`}
              >
                {i + 1}
              </span>
              <span className="truncate text-[15px] font-bold text-ink md:text-base">
                {team.name}
              </span>
              <span className="text-right text-lg font-black tabular-nums text-ink md:text-xl">
                {Math.round(total * 10) / 10}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
