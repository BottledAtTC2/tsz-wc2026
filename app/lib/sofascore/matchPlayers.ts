// Maps Sofascore lineup players to our drafted players. We match on
// normalized name (and prefer a stored sofascoreId when present), since
// bootstrapping 110 Sofascore ids by hand isn't practical before kickoff.

import { players } from "../../data/players";
import type { Player } from "../../data/types";

/** Lowercase, strip accents and special letters, collapse to [a-z ] tokens. */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // combining diacritics
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .replace(/ı/g, "i")
    .replace(/ł/g, "l")
    .replace(/ð/g, "d")
    .replace(/þ/g, "th")
    .replace(/ß/g, "ss")
    .replace(/['’.]/g, "")
    .replace(/[^a-z]+/g, " ")
    .trim();
}

const byNormalized = new Map<string, Player>();
const bySofascoreId = new Map<number, Player>();
const byOurId = new Map<string, Player>();
for (const p of players) {
  byNormalized.set(normalizeName(p.name), p);
  byOurId.set(p.id, p);
  if (p.sofascoreId != null) bySofascoreId.set(p.sofascoreId, p);
}

/** Index of last-token → players, to fall back on surname-only matches. */
const bySurname = new Map<string, Player[]>();
for (const p of players) {
  const tokens = normalizeName(p.name).split(" ");
  const surname = tokens[tokens.length - 1];
  const list = bySurname.get(surname) ?? [];
  list.push(p);
  bySurname.set(surname, list);
}

/**
 * Resolve a Sofascore player to one of our drafted players, or null.
 * Tries: learned id-map → player's own sofascoreId → exact normalized name →
 * unique surname match. `idMap` is the learned sofascoreId → our-id store.
 */
export function resolvePlayer(
  sofascoreId: number | undefined,
  name: string,
  idMap?: Map<number, string>,
): Player | null {
  if (sofascoreId != null) {
    const learnedId = idMap?.get(sofascoreId);
    if (learnedId) {
      const learned = byOurId.get(learnedId);
      if (learned) return learned;
    }
    const byId = bySofascoreId.get(sofascoreId);
    if (byId) return byId;
  }
  const norm = normalizeName(name);
  const exact = byNormalized.get(norm);
  if (exact) return exact;

  // Surname fallback only when unambiguous.
  const tokens = norm.split(" ");
  const surname = tokens[tokens.length - 1];
  const candidates = bySurname.get(surname);
  if (candidates && candidates.length === 1) return candidates[0];

  return null;
}
