// Server-only store of learned Sofascore player ids. Populated as a byproduct
// of ingest: once a player is name-matched in a match, their Sofascore id is
// recorded here so future matches resolve by exact id instead of by name.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const STORE_PATH = path.join(process.cwd(), "data", "sofascore-ids.json");

/** Learned map: Sofascore player id → our player id. */
export function loadIdMap(): Map<number, string> {
  try {
    const obj = JSON.parse(readFileSync(STORE_PATH, "utf8")) as Record<
      string,
      string
    >;
    return new Map(Object.entries(obj).map(([k, v]) => [Number(k), v]));
  } catch {
    return new Map();
  }
}

/** Record any new id→player mappings. Returns how many were newly added. */
export function recordIds(
  pairs: { sofascoreId: number; playerId: string }[],
): number {
  const map = loadIdMap();
  let added = 0;
  for (const { sofascoreId, playerId } of pairs) {
    if (sofascoreId != null && !map.has(sofascoreId)) {
      map.set(sofascoreId, playerId);
      added += 1;
    }
  }
  if (added > 0) {
    const obj = Object.fromEntries(
      [...map.entries()].map(([k, v]) => [String(k), v]),
    );
    mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    writeFileSync(STORE_PATH, JSON.stringify(obj, null, 2) + "\n", "utf8");
  }
  return added;
}
