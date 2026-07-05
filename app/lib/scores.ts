// Server-only persistence + aggregation for computed fantasy points.
// Reads/writes data/scores.json at request time so the UI reflects ingested
// matches without a rebuild. Only import this from Server Components / Route
// Handlers (it uses Node fs).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { teams, teamById } from "../data/teams";
import { pools } from "../data/pools";
import {
  activePlayerForSlot,
  roleForPlayerInEvent,
  type ReplaceableRoster,
} from "./replacements";
import { SCORING, type CaptainRole } from "./scoring";
import type { MatchResult } from "./sofascore/ingest";

export interface ScoresStore {
  matches: Record<string, MatchResult>;
}

const STORE_PATH = path.join(process.cwd(), "data", "scores.json");

export function loadScores(): ScoresStore {
  try {
    const raw = readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as ScoresStore;
    return parsed.matches ? parsed : { matches: {} };
  } catch {
    return { matches: {} };
  }
}

export function saveMatchResult(result: MatchResult): void {
  const store = loadScores();
  store.matches[String(result.eventId)] = result;
  mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2) + "\n", "utf8");
}

export function allMatches(store = loadScores()): MatchResult[] {
  return Object.values(store.matches).sort((a, b) => b.eventId - a.eventId);
}

/**
 * Per-team, per-player season totals (with that team's captain multiplier
 * applied). A player drafted by several teams contributes separately to each.
 */
export function teamPlayerTotals(
  teamId: string,
  store = loadScores(),
  eventIds?: Set<string>,
): Map<string, number> {
  const map = new Map<string, number>();
  const team = teamById.get(teamId);
  if (!team) return map;
  for (const [eid, match] of Object.entries(store.matches)) {
    if (eventIds && !eventIds.has(eid)) continue;
    for (const slotId of team.squad) {
      const playerId = activePlayerForSlot(team, slotId, Number(eid));
      const p = baseResultForPlayer(match, playerId);
      if (!p) continue;
      map.set(
        playerId,
        (map.get(playerId) ?? 0) +
          adjustedTeamTotal(teamId, match, playerId, p.base),
      );
    }
  }
  return map;
}

function addBreakdownLine(
  b: PlayerSeasonBreakdown,
  label: string,
  points: number,
) {
  const existing = b.lines.find((l) => l.label === label);
  if (existing) existing.points += points;
  else b.lines.push({ label, points });
}

function basePointsForPlayer(match: MatchResult, playerId: string): number {
  const row = match.players.find((p) => p.playerId === playerId);
  return row?.base ?? 0;
}

function baseResultForPlayer(
  match: MatchResult,
  playerId: string,
): MatchResult["players"][number] | undefined {
  return match.players.find((p) => p.playerId === playerId);
}

function roleMultiplier(role: CaptainRole): number {
  if (role === "captain") return SCORING.captainMultiplier;
  if (role === "vice") return SCORING.viceCaptainMultiplier;
  return 1;
}

function adjustedTeamRole(
  teamId: string,
  match: MatchResult,
  playerId: string,
): CaptainRole {
  const team = teamById.get(teamId);
  if (!team) return "none";
  return roleForPlayerInEvent(team, playerId, match.eventId);
}

function adjustedTeamTotal(
  teamId: string,
  match: MatchResult,
  playerId: string,
  base: number,
): number {
  return base * roleMultiplier(adjustedTeamRole(teamId, match, playerId));
}

function teamTotalForPlayer(
  match: MatchResult,
  teamId: string,
  playerId: string,
): number {
  const row = baseResultForPlayer(match, playerId);
  return row ? adjustedTeamTotal(teamId, match, playerId, row.base) : 0;
}

export function rosterSlotBaseTotals(
  roster: ReplaceableRoster,
  store = loadScores(),
  eventIds?: Set<string>,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const [eid, match] of Object.entries(store.matches)) {
    if (eventIds && !eventIds.has(eid)) continue;
    for (const slotId of roster.squad) {
      const activeId = activePlayerForSlot(roster, slotId, Number(eid));
      map.set(slotId, (map.get(slotId) ?? 0) + basePointsForPlayer(match, activeId));
    }
  }
  return map;
}

export function rosterSlotBaseBreakdowns(
  roster: ReplaceableRoster,
  store = loadScores(),
  eventIds?: Set<string>,
): Map<string, PlayerSeasonBreakdown> {
  const map = new Map<string, PlayerSeasonBreakdown>();
  for (const [eid, match] of Object.entries(store.matches)) {
    if (eventIds && !eventIds.has(eid)) continue;
    for (const slotId of roster.squad) {
      const activeId = activePlayerForSlot(roster, slotId, Number(eid));
      const row = baseResultForPlayer(match, activeId);
      if (!row) continue;
      let b = map.get(slotId);
      if (!b) {
        b = { total: 0, lines: [] };
        map.set(slotId, b);
      }
      b.total += row.base;
      for (const l of row.lines) addBreakdownLine(b, l.label, l.points);
    }
  }
  return map;
}

export function rosterSlotTotals(
  roster: ReplaceableRoster,
  store = loadScores(),
  eventIds?: Set<string>,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const [eid, match] of Object.entries(store.matches)) {
    if (eventIds && !eventIds.has(eid)) continue;
    for (const slotId of roster.squad) {
      const activeId = activePlayerForSlot(roster, slotId, Number(eid));
      const row = baseResultForPlayer(match, activeId);
      if (!row) continue;
      const role = roleForPlayerInEvent(roster, activeId, Number(eid));
      map.set(slotId, (map.get(slotId) ?? 0) + row.base * roleMultiplier(role));
    }
  }
  return map;
}

export function rosterPlayerBreakdowns(
  roster: ReplaceableRoster,
  store = loadScores(),
  eventIds?: Set<string>,
): Map<string, PlayerSeasonBreakdown> {
  const map = new Map<string, PlayerSeasonBreakdown>();
  for (const [eid, match] of Object.entries(store.matches)) {
    if (eventIds && !eventIds.has(eid)) continue;
    for (const slotId of roster.squad) {
      const activeId = activePlayerForSlot(roster, slotId, Number(eid));
      const row = baseResultForPlayer(match, activeId);
      if (!row) continue;
      let b = map.get(activeId);
      if (!b) {
        b = { total: 0, lines: [] };
        map.set(activeId, b);
      }
      const role = roleForPlayerInEvent(roster, activeId, Number(eid));
      const multiplier = roleMultiplier(role);
      const total = row.base * multiplier;
      b.total += total;
      for (const l of row.lines) addBreakdownLine(b, l.label, l.points);
      if (multiplier !== 1) {
        const label =
          role === "captain"
            ? `Captain (×${multiplier})`
            : `Vice-captain (×${multiplier})`;
        addBreakdownLine(b, label, total - row.base);
      }
    }
  }
  return map;
}

function teamSlotTotals(
  teamId: string,
  store = loadScores(),
  eventIds?: Set<string>,
): Map<string, number> {
  const team = teamById.get(teamId);
  const map = new Map<string, number>();
  if (!team) return map;
  for (const [eid, match] of Object.entries(store.matches)) {
    if (eventIds && !eventIds.has(eid)) continue;
    for (const slotId of team.squad) {
      const activeId = activePlayerForSlot(team, slotId, Number(eid));
      map.set(
        slotId,
        (map.get(slotId) ?? 0) + teamTotalForPlayer(match, teamId, activeId),
      );
    }
  }
  return map;
}

export function teamSlotBreakdowns(
  teamId: string,
  store = loadScores(),
): Map<string, PlayerSeasonBreakdown> {
  const team = teamById.get(teamId);
  const map = new Map<string, PlayerSeasonBreakdown>();
  if (!team) return map;
  for (const [eid, match] of Object.entries(store.matches)) {
    for (const slotId of team.squad) {
      const activeId = activePlayerForSlot(team, slotId, Number(eid));
      const row = baseResultForPlayer(match, activeId);
      if (!row) continue;
      let b = map.get(slotId);
      if (!b) {
        b = { total: 0, lines: [] };
        map.set(slotId, b);
      }
      const role = adjustedTeamRole(teamId, match, activeId);
      const total = row.base * roleMultiplier(role);
      b.total += total;
      for (const l of row.lines) addBreakdownLine(b, l.label, l.points);
      const multiplier = roleMultiplier(role);
      if (multiplier !== 1) {
        const label =
          role === "captain"
            ? `Captain (×${multiplier})`
            : `Vice-captain (×${multiplier})`;
        addBreakdownLine(b, label, total - row.base);
      }
    }
  }
  return map;
}

export interface PlayerSeasonBreakdown {
  /** Team-specific season total (captain multiplier included). */
  total: number;
  /** Point-earning actions, aggregated across matches, summing to `total`. */
  lines: { label: string; points: number }[];
}

/**
 * Per-player season breakdown for one team: each scoring action (goals,
 * started, chances, cards…) aggregated across matches, plus the captain/vice
 * bonus, so the lines add up to the player's team total.
 */
export function teamPlayerBreakdowns(
  teamId: string,
  store = loadScores(),
): Map<string, PlayerSeasonBreakdown> {
  const map = new Map<string, PlayerSeasonBreakdown>();
  const team = teamById.get(teamId);
  if (!team) return map;
  for (const [eid, match] of Object.entries(store.matches)) {
    for (const slotId of team.squad) {
      const playerId = activePlayerForSlot(team, slotId, Number(eid));
      const p = baseResultForPlayer(match, playerId);
      if (!p) continue;
      let b = map.get(playerId);
      if (!b) {
        b = { total: 0, lines: [] };
        map.set(playerId, b);
      }
      const role = adjustedTeamRole(teamId, match, playerId);
      const multiplier = roleMultiplier(role);
      const total = p.base * multiplier;
      b.total += total;
      for (const l of p.lines) addBreakdownLine(b, l.label, l.points);
      if (multiplier !== 1) {
        const label =
          role === "captain"
            ? `Captain (×${multiplier})`
            : `Vice-captain (×${multiplier})`;
        addBreakdownLine(b, label, total - p.base);
      }
    }
  }
  return map;
}

/**
 * Season points per fantasy team. Each pool decides how many of the 11 players
 * count (`countTop`): the TSZ Pool counts the best 10; the CCO Pool counts all.
 */
export function teamPointsMap(
  store = loadScores(),
  eventIds?: Set<string>,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const team of teams) {
    const totals = teamSlotTotals(team.id, store, eventIds);
    const countTop = pools.find((p) => p.id === team.poolId)?.countTop;
    const sorted = team.squad
      .map((pid) => totals.get(pid) ?? 0)
      .sort((a, b) => b - a);
    const counted = countTop ? sorted.slice(0, countTop) : sorted;
    let sum = counted.reduce((s, x) => s + x, 0);
    // `points` is a manual season adjustment (penalties/bonuses). Apply it to
    // the cumulative total only, not to a single round (RD pts).
    if (!eventIds) sum += team.points ?? 0;
    map.set(team.id, sum);
  }
  return map;
}

/**
 * Season points per real player id — the player's own (base) points, without
 * any captain multiplier, counted once per match even if owned by many teams.
 */
export function playerPointsMap(
  store = loadScores(),
  eventIds?: Set<string>,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const [eid, match] of Object.entries(store.matches)) {
    if (eventIds && !eventIds.has(eid)) continue;
    const seen = new Set<string>();
    for (const p of match.players) {
      if (seen.has(p.playerId)) continue;
      seen.add(p.playerId);
      map.set(p.playerId, (map.get(p.playerId) ?? 0) + p.base);
    }
  }
  return map;
}

/**
 * Per-player season breakdown (base points + aggregated scoring lines), keyed
 * by player id and independent of any fantasy team. Used by Dream Team views,
 * which aren't stored in scores.json.
 */
export function playerBreakdowns(
  store = loadScores(),
): Map<string, PlayerSeasonBreakdown> {
  const map = new Map<string, PlayerSeasonBreakdown>();
  for (const match of Object.values(store.matches)) {
    const seen = new Set<string>();
    for (const p of match.players) {
      if (seen.has(p.playerId)) continue;
      seen.add(p.playerId);
      let b = map.get(p.playerId);
      if (!b) {
        b = { total: 0, lines: [] };
        map.set(p.playerId, b);
      }
      b.total += p.base;
      for (const l of p.lines) {
        addBreakdownLine(b, l.label, l.points);
      }
    }
  }
  return map;
}

/** Which players count toward a team's total (best N by that team's totals). */
export function countedPlayerIds(
  teamId: string,
  store = loadScores(),
): Set<string> {
  const team = teamById.get(teamId);
  if (!team) return new Set();
  const countTop = pools.find((p) => p.id === team.poolId)?.countTop;
  if (!countTop) return new Set(team.squad);
  const totals = teamSlotTotals(teamId, store);
  return new Set(
    team.squad
      .map((pid) => ({ pid, pts: totals.get(pid) ?? 0 }))
      .sort((a, b) => b.pts - a.pts)
      .slice(0, countTop)
      .map((x) => x.pid),
  );
}

/** All per-match contributions for one fantasy team, newest first. */
export function teamBreakdown(
  teamId: string,
  store = loadScores(),
): { match: MatchResult; contributions: MatchResult["players"] }[] {
  return allMatches(store)
    .map((match) => ({
      match,
      contributions: match.players.filter((p) => p.teamId === teamId),
    }))
    .filter((row) => row.contributions.length > 0);
}
