// Fantasy points engine for TSZ World Cup 2026 — football scoring system.
//
// This is the single source of truth for how points are awarded. The rules
// page renders from SCORING, and the (upcoming) Sofascore pipeline will feed
// PlayerMatchStats into computeBasePoints() to produce per-match points.

import type { Position } from "../data/types";

/** Point values, transcribed from the official "How to Play" scoring sheet. */
export const SCORING = {
  // --- Attack ---
  /** Goal scored, by position of the scorer. */
  goal: { FWD: 40, MID: 50, DEF: 60, GK: 60 } as Record<Position, number>,
  assist: 20,
  /** Final pass leading to a shot (on target, blocked, or off target). */
  chanceCreated: 3,
  /** Shot on target (includes goals). */
  shotOnTarget: 6,
  /** Per 5 completed passes. */
  passesPerPoint: 5,
  passBlock: 1,

  // --- Defense ---
  tackleWon: 4,
  interceptionWon: 4,
  /** Per save (GK only). */
  save: 6,
  /** Penalty saved (GK only). */
  penaltySaved: 50,
  /** Clean sheet (GK/DEF who played more than 54 minutes). */
  cleanSheet: 20,
  cleanSheetMinMinutes: 54,

  // --- Appearance ---
  starting11: 4,
  substituteAppearance: 2,

  // --- Multipliers ---
  captainMultiplier: 2,
  viceCaptainMultiplier: 1.5,

  // --- Cards & penalties ---
  yellowCard: -4,
  redCard: -10,
  ownGoal: -8,
  /** Per goal conceded, for GK/DEF on the field when the goal is scored. */
  goalConceded: -2,
  penaltyMissed: -20,
} as const;

/** Per-player, per-match raw statistics (the shape the pipeline will produce). */
export interface PlayerMatchStats {
  position: Position;
  /** Minutes played; drives clean-sheet eligibility and appearance points. */
  minutes: number;
  /** True if the player was in the starting XI, false if a substitute. */
  started: boolean;
  goals: number;
  assists: number;
  chancesCreated: number;
  shotsOnTarget: number;
  passesCompleted: number;
  tacklesWon: number;
  interceptionsWon: number;
  saves: number;
  penaltiesSaved: number;
  /** Team kept a clean sheet while this player was eligible (GK/DEF, >54'). */
  cleanSheet: boolean;
  yellowCards: number;
  /** 1 if sent off (straight red or second yellow), else 0. */
  redCards: number;
  ownGoals: number;
  goalsConceded: number;
  penaltiesMissed: number;
}

export type CaptainRole = "captain" | "vice" | "none";

/** A line-item contribution to a player's score, for transparent breakdowns. */
export interface ScoreLine {
  label: string;
  count: number;
  pointsEach: number;
  points: number;
}

export interface PlayerScore {
  lines: ScoreLine[];
  /** Points before any captain/vice multiplier. */
  base: number;
  role: CaptainRole;
  multiplier: number;
  /** Final points after the captain/vice multiplier. */
  total: number;
}

function line(label: string, count: number, pointsEach: number): ScoreLine {
  return { label, count, pointsEach, points: count * pointsEach };
}

/**
 * Compute a player's fantasy points for a single match.
 *
 * `role` applies the captain (2x) / vice-captain (1.5x) multiplier to the
 * total. Pass "none" for ordinary squad members.
 */
export function computePlayerScore(
  stats: PlayerMatchStats,
  role: CaptainRole = "none",
): PlayerScore {
  const s = SCORING;
  const pos = stats.position;
  const lines: ScoreLine[] = [];

  // Appearance
  if (stats.minutes > 0) {
    lines.push(
      stats.started
        ? line("Started", 1, s.starting11)
        : line("Substitute appearance", 1, s.substituteAppearance),
    );
  }

  // Attack
  if (stats.goals) lines.push(line(`Goal (${pos})`, stats.goals, s.goal[pos]));
  if (stats.assists) lines.push(line("Assist", stats.assists, s.assist));
  if (stats.chancesCreated)
    lines.push(line("Chance created", stats.chancesCreated, s.chanceCreated));
  if (stats.shotsOnTarget)
    lines.push(line("Shot on target", stats.shotsOnTarget, s.shotOnTarget));
  const passPoints = Math.floor(stats.passesCompleted / s.passesPerPoint);
  if (passPoints)
    lines.push(line("Passes completed (per 5)", passPoints, s.passBlock));

  // Defense
  if (stats.tacklesWon)
    lines.push(line("Tackle won", stats.tacklesWon, s.tackleWon));
  if (stats.interceptionsWon)
    lines.push(line("Interception won", stats.interceptionsWon, s.interceptionWon));
  if (stats.saves) lines.push(line("Save", stats.saves, s.save));
  if (stats.penaltiesSaved)
    lines.push(line("Penalty saved", stats.penaltiesSaved, s.penaltySaved));
  if (stats.cleanSheet && (pos === "GK" || pos === "DEF"))
    lines.push(line("Clean sheet", 1, s.cleanSheet));

  // Cards & penalties
  if (stats.yellowCards)
    lines.push(line("Yellow card", stats.yellowCards, s.yellowCard));
  if (stats.redCards) lines.push(line("Red card", stats.redCards, s.redCard));
  if (stats.ownGoals) lines.push(line("Own goal", stats.ownGoals, s.ownGoal));
  if (stats.goalsConceded && (pos === "GK" || pos === "DEF"))
    lines.push(line("Goal conceded", stats.goalsConceded, s.goalConceded));
  if (stats.penaltiesMissed)
    lines.push(line("Penalty missed", stats.penaltiesMissed, s.penaltyMissed));

  const base = lines.reduce((sum, l) => sum + l.points, 0);
  const multiplier =
    role === "captain"
      ? s.captainMultiplier
      : role === "vice"
        ? s.viceCaptainMultiplier
        : 1;

  return {
    lines,
    base,
    role,
    multiplier,
    total: base * multiplier,
  };
}
