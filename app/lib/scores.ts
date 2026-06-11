// Server-only persistence + aggregation for computed fantasy points.
// Reads/writes data/scores.json at request time so the UI reflects ingested
// matches without a rebuild. Only import this from Server Components / Route
// Handlers (it uses Node fs).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
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

/** Season points per fantasy team id. */
export function teamPointsMap(store = loadScores()): Map<string, number> {
  const map = new Map<string, number>();
  for (const match of Object.values(store.matches)) {
    for (const p of match.players) {
      map.set(p.teamId, (map.get(p.teamId) ?? 0) + p.total);
    }
  }
  return map;
}

/** Season points per real player id. */
export function playerPointsMap(store = loadScores()): Map<string, number> {
  const map = new Map<string, number>();
  for (const match of Object.values(store.matches)) {
    for (const p of match.players) {
      map.set(p.playerId, (map.get(p.playerId) ?? 0) + p.total);
    }
  }
  return map;
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
