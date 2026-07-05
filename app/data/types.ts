// Core domain types for the TSZ World Cup 2026 fantasy league.

export type Position = "GK" | "DEF" | "MID" | "FWD";

export type PlayerId = string;

/** Injury replacement rule for a roster slot. */
export interface ReplacementRule {
  /** The drafted/original player whose points stop at the cutoff. */
  outgoingId: PlayerId;
  /** The replacement player whose points start at the cutoff. */
  incomingId: PlayerId;
  /**
   * Replacement starts with this Sofascore event id, inclusive.
   * Use when the replacement should count "from this game onwards".
   */
  startsEventId?: number;
  /**
   * Replacement starts after this Sofascore event id, exclusive.
   * Use when the injured player should still count for this game.
   */
  startsAfterEventId?: number;
  /**
   * Exact Sofascore event ids where the replacement should count. If set, this
   * overrides the chronological start fields above.
   */
  scoringEventIds?: number[];
  /**
   * Optional captain/vice changes that start at the same cutoff as this
   * replacement. Use when the injured player had one of those roles.
   */
  newCaptainId?: PlayerId;
  newViceCaptainId?: PlayerId;
  note?: string;
}

/** A real-world World Cup player. */
export interface Player {
  id: PlayerId;
  name: string;
  /** National team, e.g. "Argentina". */
  country: string;
  position: Position;
  /** Club side (optional, for display). */
  club?: string;
  /** Alternate names Sofascore may use (nicknames), for matching. */
  aliases?: string[];
  /** Sofascore player id, used by the stats pipeline. */
  sofascoreId?: number;
}

/** A fantasy team owned by one of the league members. */
export interface FantasyTeam {
  id: string;
  name: string;
  poolId: string;
  /** Drafted real players (player ids). Filled from the auction/draft. */
  squad: PlayerId[];
  /** Injury replacements. Keep the original in `squad`; add replacements here. */
  replacements?: ReplacementRule[];
  captainId?: PlayerId;
  viceCaptainId?: PlayerId;
  /**
   * Transitional display names, used until squads are drafted and the
   * captain/vice-captain are linked to real player ids.
   */
  captainName?: string;
  viceCaptainName?: string;
  /**
   * Manual season adjustment added to the team's computed total — use for
   * penalties (e.g. -150) or bonuses. 0 = no adjustment. Does not affect RD pts.
   */
  points: number;
}

export interface Pool {
  id: string;
  name: string;
  /**
   * How many of a team's 11 players count toward its total. Undefined means
   * all players count; e.g. 10 means the best 10 of 11 (lowest dropped).
   */
  countTop?: number;
}

export type FixtureStatus = "scheduled" | "live" | "finished";

/** A World Cup match. */
export interface Fixture {
  id: string;
  /** e.g. "Group A", "Round of 16", "Final". */
  stage: string;
  /** Country names of the two sides. "TBD" before the draw resolves. */
  home: string;
  away: string;
  /** Kickoff time as an ISO 8601 string (UTC). */
  kickoff: string;
  venue?: string;
  homeScore?: number;
  awayScore?: number;
  status?: FixtureStatus;
  /** Sofascore event id, used by the stats pipeline. */
  sofascoreId?: number;
}
