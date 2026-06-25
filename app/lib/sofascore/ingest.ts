// Core ingest: turn one Sofascore match bundle into fantasy points.
//
// Pure and network-free — it consumes already-fetched JSON (from the Python
// scraper) so it can be unit-tested deterministically and run anywhere.

import { teams } from "../../data/teams";
import { playerById } from "../../data/players";
import type { Position } from "../../data/types";
import { computePlayerScore } from "../scoring";
import type {
  CaptainRole,
  PlayerMatchStats,
  ScoreLine,
} from "../scoring";
import { resolvePlayer, normalizeCountry } from "./matchPlayers";
import type {
  SofaEvent,
  SofaIncident,
  SofaLineupPlayer,
  SofaMatchBundle,
} from "./types";

/** Owning fantasy team + captain role for each drafted player. */
interface Ownership {
  teamId: string;
  role: CaptainRole;
}

// A real player can be drafted by several fantasy teams (e.g. one per pool),
// each with its own captain/vice designation — so each player maps to a LIST
// of owners.
const ownership = new Map<string, Ownership[]>();
for (const t of teams) {
  for (const pid of t.squad) {
    const role: CaptainRole =
      pid === t.captainId ? "captain" : pid === t.viceCaptainId ? "vice" : "none";
    const owners = ownership.get(pid) ?? [];
    owners.push({ teamId: t.id, role });
    ownership.set(pid, owners);
  }
}

export interface PlayerMatchResult {
  playerId: string;
  /** Sofascore player id from the lineup, used to learn id mappings. */
  sofascoreId: number;
  name: string;
  teamId: string;
  role: CaptainRole;
  stats: PlayerMatchStats;
  base: number;
  multiplier: number;
  total: number;
  lines: ScoreLine[];
}

/** A drafted player from a playing nation who wasn't scored this match. */
export interface UnmatchedDrafted {
  playerId: string;
  name: string;
  country: string;
  teamId: string;
}

export interface MatchResult {
  eventId: number;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  status?: string;
  /** Only drafted players who featured; one entry each. */
  players: PlayerMatchResult[];
  /** Featured lineup names we couldn't match to any drafted player. */
  unresolved: string[];
  /**
   * Drafted players whose nation played but who weren't scored — either an
   * unused sub, or (worth checking) a name that didn't match the lineup.
   */
  unmatchedDrafted: UnmatchedDrafted[];
}

type Side = "home" | "away";

const MATCH_END = 200; // covers 90' + stoppage + extra time

/** The side that conceded a given goal (handles own goals via `isHome`). */
function concedingSide(inc: SofaIncident): Side {
  // Sofascore `isHome` flags the team credited with the goal; the other side
  // conceded. This holds for regular, penalty, and own goals alike.
  return inc.isHome ? "away" : "home";
}

/** Build the statistics-derived portion of a player's stat line. */
function statLine(
  entry: SofaLineupPlayer,
  position: Position,
): PlayerMatchStats {
  const s = entry.statistics ?? {};
  return {
    position,
    minutes: s.minutesPlayed ?? 0,
    started: entry.substitute !== true,
    goals: s.goals ?? 0,
    assists: s.goalAssist ?? 0,
    chancesCreated: s.keyPass ?? 0,
    shotsOnTarget: s.onTargetScoringAttempt ?? 0,
    passesCompleted: s.accuratePass ?? 0,
    tacklesWon: s.totalTackle ?? 0,
    interceptionsWon: s.interceptionWon ?? 0,
    saves: s.saves ?? 0,
    penaltiesSaved: s.penaltySave ?? 0,
    // Filled from incidents / event context below:
    cleanSheet: false,
    yellowCards: 0,
    redCards: 0,
    ownGoals: 0,
    goalsConceded: 0,
    penaltiesMissed: 0,
  };
}

/** Apply incident- and window-derived adjustments in place. */
function applyContext(
  stats: PlayerMatchStats,
  sofaId: number,
  side: Side,
  incidents: SofaIncident[],
): void {
  // On-pitch window from substitutions.
  let onStart = stats.started ? 0 : MATCH_END;
  let onEnd = MATCH_END;
  for (const inc of incidents) {
    if (inc.incidentType !== "substitution") continue;
    if (inc.playerIn?.id === sofaId) onStart = inc.time ?? onStart;
    if (inc.playerOut?.id === sofaId) onEnd = inc.time ?? onEnd;
  }

  let hasRed = false;
  let yellows = 0;
  for (const inc of incidents) {
    if (inc.incidentType === "card" && inc.player?.id === sofaId) {
      if (inc.incidentClass === "red" || inc.incidentClass === "yellowRed") {
        hasRed = true;
      } else if (inc.incidentClass === "yellow") {
        yellows += 1;
      }
    }
    if (
      inc.incidentType === "goal" &&
      inc.incidentClass === "ownGoal" &&
      inc.player?.id === sofaId
    ) {
      stats.ownGoals += 1;
    }
    // Missed penalty in open play (not a shootout).
    if (
      inc.incidentClass === "missed" &&
      inc.incidentType !== "penaltyShootout" &&
      inc.player?.id === sofaId
    ) {
      stats.penaltiesMissed += 1;
    }
  }
  // A red (incl. second yellow) supersedes the yellow points.
  stats.redCards = hasRed ? 1 : 0;
  stats.yellowCards = hasRed ? 0 : yellows;

  // Goals conceded while on the pitch (GK/DEF relevant for points/clean sheet).
  let conceded = 0;
  for (const inc of incidents) {
    if (inc.incidentType !== "goal") continue;
    if (concedingSide(inc) !== side) continue;
    const t = inc.time ?? 0;
    if (t >= onStart && t <= onEnd) conceded += 1;
  }
  stats.goalsConceded = conceded;
  stats.cleanSheet =
    (stats.position === "GK" || stats.position === "DEF") &&
    stats.minutes > 54 &&
    conceded === 0;
}

/**
 * Score a single match bundle. Returns per-player results for every drafted
 * player who featured; undrafted players are ignored.
 */
export function scoreEvent(
  bundle: SofaMatchBundle,
  idMap?: Map<number, string>,
): MatchResult {
  const { event, lineups, incidents } = bundle;
  const incs = incidents.incidents ?? [];
  const results: PlayerMatchResult[] = [];
  const unresolved: string[] = [];

  const sides: Side[] = ["home", "away"];
  for (const side of sides) {
    const sideCountry =
      side === "home" ? event.homeTeam?.name : event.awayTeam?.name;
    const entries = lineups[side]?.players ?? [];
    for (const entry of entries) {
      const sofaId = entry.player.id;
      const featured = (entry.statistics?.minutesPlayed ?? 0) > 0;
      const player = resolvePlayer(
        sofaId,
        entry.player.name,
        idMap,
        sideCountry,
      );
      if (!player) {
        // Only flag players who actually played — an unmatched bench-warmer
        // is noise; an unmatched starter may be a name mismatch.
        if (featured) unresolved.push(entry.player.name);
        continue;
      }
      const stats = statLine(entry, player.position);
      if (stats.minutes <= 0) continue; // didn't feature
      applyContext(stats, sofaId, side, incs);

      // Auction owners each get a result (with their captain multiplier).
      // A player drafted only in drafts/dream-teams has no auction owner — store
      // one neutral result (teamId "") so their base stats are still recorded
      // for those views. Auction pages filter by teamId, so "" never shows.
      const owners = ownership.get(player.id) ?? [
        { teamId: "", role: "none" as CaptainRole },
      ];
      for (const own of owners) {
        const score = computePlayerScore(stats, own.role);
        results.push({
          playerId: player.id,
          sofascoreId: sofaId,
          name: player.name,
          teamId: own.teamId,
          role: own.role,
          stats,
          base: score.base,
          multiplier: score.multiplier,
          total: score.total,
          lines: score.lines,
        });
      }
    }
  }

  const scoredIds = new Set(results.map((r) => r.playerId));
  return {
    eventId: event.id,
    home: event.homeTeam?.name ?? "Home",
    away: event.awayTeam?.name ?? "Away",
    homeScore: event.homeScore?.normaltime ?? event.homeScore?.current ?? null,
    awayScore: event.awayScore?.normaltime ?? event.awayScore?.current ?? null,
    status: event.status?.type,
    players: results,
    unresolved,
    unmatchedDrafted: unmatchedDrafted(event, scoredIds),
  };
}

/** Drafted players whose nation played this match but who weren't scored. */
function unmatchedDrafted(
  event: SofaEvent,
  scoredIds: Set<string>,
): UnmatchedDrafted[] {
  const nations = new Set(
    [event.homeTeam?.name, event.awayTeam?.name]
      .map(normalizeCountry)
      .filter(Boolean),
  );
  if (nations.size === 0) return [];

  const out: UnmatchedDrafted[] = [];
  for (const [playerId, owners] of ownership) {
    if (scoredIds.has(playerId)) continue;
    const p = playerById.get(playerId);
    if (p && nations.has(normalizeCountry(p.country))) {
      out.push({
        playerId,
        name: p.name,
        country: p.country,
        teamId: owners.map((o) => o.teamId).join(", "),
      });
    }
  }
  return out;
}
