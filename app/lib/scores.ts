// Server-only persistence + aggregation for computed fantasy points.
// Reads/writes data/scores.json at request time so the UI reflects ingested
// matches without a rebuild. Only import this from Server Components / Route
// Handlers (it uses Node fs).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { teams, teamById } from "../data/teams";
import { pools } from "../data/pools";
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
): Map<string, number> {
  const map = new Map<string, number>();
  for (const match of Object.values(store.matches)) {
    for (const p of match.players) {
      if (p.teamId !== teamId) continue;
      map.set(p.playerId, (map.get(p.playerId) ?? 0) + p.total);
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
  const addLine = (b: PlayerSeasonBreakdown, label: string, points: number) => {
    const existing = b.lines.find((l) => l.label === label);
    if (existing) existing.points += points;
    else b.lines.push({ label, points });
  };
  for (const match of Object.values(store.matches)) {
    for (const p of match.players) {
      if (p.teamId !== teamId) continue;
      let b = map.get(p.playerId);
      if (!b) {
        b = { total: 0, lines: [] };
        map.set(p.playerId, b);
      }
      b.total += p.total;
      for (const l of p.lines) addLine(b, l.label, l.points);
      if (p.multiplier !== 1) {
        const label =
          p.role === "captain"
            ? `Captain (×${p.multiplier})`
            : `Vice-captain (×${p.multiplier})`;
        addLine(b, label, p.total - p.base);
      }
    }
  }
  return map;
}

/**
 * Season points per fantasy team. Each pool decides how many of the 11 players
 * count (`countTop`): the TSZ Pool counts the best 10; the CCO Pool counts all.
 */
export function teamPointsMap(store = loadScores()): Map<string, number> {
  const map = new Map<string, number>();
  for (const team of teams) {
    const totals = teamPlayerTotals(team.id, store);
    const countTop = pools.find((p) => p.id === team.poolId)?.countTop;
    const sorted = team.squad
      .map((pid) => totals.get(pid) ?? 0)
      .sort((a, b) => b - a);
    const counted = countTop ? sorted.slice(0, countTop) : sorted;
    map.set(
      team.id,
      counted.reduce((s, x) => s + x, 0),
    );
  }
  return map;
}

/**
 * Season points per real player id — the player's own (base) points, without
 * any captain multiplier, counted once per match even if owned by many teams.
 */
export function playerPointsMap(store = loadScores()): Map<string, number> {
  const map = new Map<string, number>();
  for (const match of Object.values(store.matches)) {
    const seen = new Set<string>();
    for (const p of match.players) {
      if (seen.has(p.playerId)) continue;
      seen.add(p.playerId);
      map.set(p.playerId, (map.get(p.playerId) ?? 0) + p.base);
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
  const totals = teamPlayerTotals(teamId, store);
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
