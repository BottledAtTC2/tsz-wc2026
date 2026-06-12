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
    <section className="mb-6 overflow-hidden rounded-xl border border-edge">
      <h2 className="border-b border-edge bg-panel px-4 py-3 font-semibold">
        {title}
      </h2>
      <ul className="divide-y divide-edge">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex items-center justify-between gap-4 bg-panel/40 px-4 py-3"
          >
            <div>
              <div className="text-sm">{r.label}</div>
              {r.sub && <div className="text-xs text-muted">{r.sub}</div>}
            </div>
            <span
              className={`shrink-0 rounded-md px-2.5 py-1 text-sm font-semibold ${
                r.negative
                  ? "bg-red-500/15 text-red-300"
                  : "bg-brand/20 text-brand"
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
    <main>
      <h1 className="mb-2 text-3xl font-bold">Fantasy Points System</h1>
      <p className="mb-6 text-muted">
        Football scoring. A captain&apos;s points are doubled; a
        vice-captain&apos;s are multiplied by {SCORING.viceCaptainMultiplier}.
      </p>

      <Section title="Attack" rows={attack} />
      <Section title="Defense" rows={defense} />
      <Section title="Other Points" rows={other} />
      <Section title="Cards & Other Penalties" rows={penalties} />

      <p className="text-xs text-muted">
        Goals conceded count for players on the field when the goal is scored,
        regardless of total minutes. A clean sheet requires more than{" "}
        {SCORING.cleanSheetMinMinutes} minutes on the field without conceding.
      </p>
    </main>
  );
}
