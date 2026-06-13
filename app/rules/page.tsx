import type { Metadata } from "next";
import { SCORING } from "../lib/scoring";

export const metadata: Metadata = { title: "Rules — TSZ WC 2026" };

type Row = { label: string; sub?: string; value: string; negative?: boolean };

const attack: Row[] = [
  { label: "Goal — scored by a striker", value: `+${SCORING.goal.FWD}` },
  { label: "Goal — scored by a midfielder", value: `+${SCORING.goal.MID}` },
  {
    label: "Goal — scored by a defender or goalkeeper",
    value: `+${SCORING.goal.DEF}`,
  },
  { label: "Assist", value: `+${SCORING.assist}` },
  {
    label: "Chance created",
    sub: "Final pass leading to a shot (on target, blocked, or off target)",
    value: `+${SCORING.chanceCreated}`,
  },
  { label: "Shot on target", sub: "Includes goals", value: `+${SCORING.shotOnTarget}` },
  {
    label: `${SCORING.passesPerPoint} passes completed`,
    value: `+${SCORING.passBlock}`,
  },
];

const defense: Row[] = [
  { label: "Tackle won", value: `+${SCORING.tackleWon}` },
  { label: "Interception won", value: `+${SCORING.interceptionWon}` },
  { label: "Save", sub: "GK", value: `+${SCORING.save}` },
  { label: "Penalty saved", sub: "GK", value: `+${SCORING.penaltySaved}` },
  {
    label: "Clean sheet",
    sub: `GK/DEF (played more than ${SCORING.cleanSheetMinMinutes} minutes)`,
    value: `+${SCORING.cleanSheet}`,
  },
];

const other: Row[] = [
  { label: "Captain", value: `${SCORING.captainMultiplier}x` },
  { label: "Vice-captain", value: `${SCORING.viceCaptainMultiplier}x` },
  { label: "In starting 11", value: `+${SCORING.starting11}` },
  { label: "Coming on as a substitute", value: `+${SCORING.substituteAppearance}` },
];

const penalties: Row[] = [
  { label: "Yellow card", value: `${SCORING.yellowCard}`, negative: true },
  { label: "Red card", value: `${SCORING.redCard}`, negative: true },
  { label: "Own goal", value: `${SCORING.ownGoal}`, negative: true },
  {
    label: "Goal conceded",
    sub: "GK/DEF (on the field when the goal is scored)",
    value: `${SCORING.goalConceded}`,
    negative: true,
  },
  { label: "Penalty missed", value: `${SCORING.penaltyMissed}`, negative: true },
];

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="mb-8 overflow-hidden rounded-xl border border-edge bg-panel shadow-lg">
      <h2 className="border-b-2 border-edge bg-panel2 px-5 py-4 text-lg font-black uppercase tracking-wide text-ink">
        {title}
      </h2>
      <ul className="divide-y divide-edge">
        {rows.map((r) => (
          <li
            key={r.label}
            className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-panel2"
          >
            <div>
              <div className="text-[15px] font-bold text-ink transition-colors group-hover:text-brand">
                {r.label}
              </div>
              {r.sub && (
                <div className="mt-1 text-[12px] font-bold uppercase tracking-widest text-muted">
                  {r.sub}
                </div>
              )}
            </div>
            <span
              className={`shrink-0 rounded-sm px-3 py-1.5 text-[14px] font-black tabular-nums shadow-sm transition-colors ${
                r.negative
                  ? "bg-red-600/20 text-red-500 group-hover:bg-red-600 group-hover:text-white"
                  : "bg-panel2 text-brand group-hover:bg-brand group-hover:text-black border border-edge group-hover:border-brand"
              }`}
            >
              {r.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function RulesPage() {
  return (
    <main className="font-sans">
      <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter text-ink md:text-5xl">
        Fantasy Points System
      </h1>
      <p className="mb-8 max-w-3xl text-[15px] font-bold uppercase tracking-widest text-muted leading-relaxed">
        Football scoring. A captain&apos;s points are doubled; a
        vice-captain&apos;s are multiplied by {SCORING.viceCaptainMultiplier}.
      </p>

      <Section title="Attack" rows={attack} />
      <Section title="Defense" rows={defense} />
      <Section title="Other Points" rows={other} />
      <Section title="Cards & Other Penalties" rows={penalties} />

      <p className="mt-10 rounded-lg border-2 border-dashed border-edge bg-panel p-6 text-[13px] font-bold uppercase tracking-widest text-muted leading-relaxed">
        Goals conceded count for players on the field when the goal is scored,
        regardless of total minutes. A clean sheet requires more than{" "}
        <span className="text-brand">{SCORING.cleanSheetMinMinutes}</span> minutes on the field without conceding.
      </p>
    </main>
  );
}
