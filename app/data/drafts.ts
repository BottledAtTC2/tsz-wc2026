import type { PlayerId } from "./types";

/** One side of a 1v1 draft matchup. */
export interface DraftTeam {
  name: string;
  /** Drafted real players (player ids from players.ts). */
  squad: PlayerId[];
  /** Optional captain (2x) / vice-captain (1.5x). Omit if the draft has none. */
  captainId?: PlayerId;
  viceCaptainId?: PlayerId;
  /**
   * How many of the squad's players count toward the total. Undefined = all
   * count; e.g. 5 = only the best 5 players' points count.
   */
  countTop?: number;
}

/** A head-to-head draft between two teams. */
export interface Draft {
  id: string;
  /** Optional label, e.g. "Round of 16". Falls back to "TeamA vs TeamB". */
  title?: string;
  teamA: DraftTeam;
  teamB: DraftTeam;
}

// Add 1v1 drafts here. Example (delete or replace):
//
// {
//   id: "ayush-vs-mfk",
//   teamA: {
//     name: "Ayush",
//     squad: ["messi", "yamal", "kane", "saka", "pedri"],
//     captainId: "messi",      // optional
//     viceCaptainId: "yamal",  // optional
//     countTop: 5,             // best 5 count; omit for "all count"
//   },
//   teamB: {
//     name: "MFK",
//     squad: ["haaland", "mbappe", "vinicius", "rodri", "bellingham"],
//     // no captain/vice, all players count
//   },
// },
export const drafts: Draft[] = [];
