// Typed slices of the Sofascore JSON we consume. These mirror the responses
// from the Python scraper (tunjayoff/sofascore_scraper), which stores the raw
// `/event/{id}`, `/event/{id}/lineups`, and `/event/{id}/incidents` payloads.
//
// Only the fields the scoring pipeline reads are typed; everything else in the
// real payloads is ignored. All stat fields are optional and default to 0,
// because Sofascore omits zero-valued stats.

export interface SofaScoreSide {
  name?: string;
  id?: number;
}

export interface SofaEvent {
  id: number;
  homeTeam: SofaScoreSide;
  awayTeam: SofaScoreSide;
  homeScore?: { normaltime?: number; current?: number; period1?: number };
  awayScore?: { normaltime?: number; current?: number; period1?: number };
  status?: { type?: string; description?: string };
  startTimestamp?: number;
}

/** Per-player statistics block inside a lineups entry. */
export interface SofaPlayerStatistics {
  minutesPlayed?: number;
  goals?: number;
  goalAssist?: number;
  /** Shots on target, includes goals. */
  onTargetScoringAttempt?: number;
  /** Key passes ≈ chances created (final pass leading to a shot). */
  keyPass?: number;
  bigChanceCreated?: number;
  accuratePass?: number;
  totalPass?: number;
  /** Sofascore reports successful tackles as totalTackle. */
  totalTackle?: number;
  interceptionWon?: number;
  saves?: number;
  penaltySave?: number;
  // expectedGoals, rating, etc. exist but are unused here.
}

/** One entry in a lineups side's `players` array. */
export interface SofaLineupPlayer {
  player: { id: number; name: string; position?: string; country?: { name?: string } };
  /** True if the player started on the bench. */
  substitute?: boolean;
  /** Per-player position code (G/D/M/F) on the teamsheet. */
  position?: string;
  statistics?: SofaPlayerStatistics;
}

export interface SofaLineupSide {
  players?: SofaLineupPlayer[];
  formation?: string;
}

export interface SofaLineups {
  home?: SofaLineupSide;
  away?: SofaLineupSide;
  /** Sofascore sets this once lineups are official. */
  confirmed?: boolean;
}

/** One match incident (goal, card, substitution, …). */
export interface SofaIncident {
  /** "goal" | "card" | "substitution" | "penaltyShootout" | "inGamePenalty" … */
  incidentType?: string;
  /** "regular" | "penalty" | "ownGoal" | "yellow" | "red" | "yellowRed" | "missed" … */
  incidentClass?: string;
  time?: number;
  isHome?: boolean;
  player?: { id?: number; name?: string };
  assist1?: { id?: number; name?: string };
  playerIn?: { id?: number; name?: string };
  playerOut?: { id?: number; name?: string };
  /** Some payloads flag a missed penalty here. */
  rescinded?: boolean;
}

export interface SofaIncidents {
  incidents?: SofaIncident[];
}

/** The complete per-match bundle the pipeline ingests. */
export interface SofaMatchBundle {
  event: SofaEvent;
  lineups: SofaLineups;
  incidents: SofaIncidents;
}
