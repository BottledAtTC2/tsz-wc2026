// Server-only store for the World Cup schedule. Reads/writes data/fixtures.json
// at request time. Populated from Sofascore via /api/fixtures.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { Fixture } from "../data/types";

const STORE_PATH = path.join(process.cwd(), "data", "fixtures.json");

export function loadFixtures(): Fixture[] {
  try {
    const parsed = JSON.parse(readFileSync(STORE_PATH, "utf8"));
    const list: Fixture[] = Array.isArray(parsed)
      ? parsed
      : (parsed.fixtures ?? []);
    return list
      .slice()
      .sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  } catch {
    return [];
  }
}

export function saveFixtures(fixtures: Fixture[]): void {
  mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  writeFileSync(
    STORE_PATH,
    JSON.stringify({ fixtures }, null, 2) + "\n",
    "utf8",
  );
}
