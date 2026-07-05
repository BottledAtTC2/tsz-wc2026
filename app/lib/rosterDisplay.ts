import { playerById } from "../data/players";
import type { Player } from "../data/types";
import type { ReplaceableRoster } from "./replacements";
import type { ScoresStore } from "./scores";

export interface RosterDisplayPlayer {
  player: Player;
  originalId: string;
  replacementFor?: Player;
  replacedBy?: Player;
}

export function rosterDisplayPlayers(
  roster: ReplaceableRoster,
): RosterDisplayPlayer[] {
  const rows: RosterDisplayPlayer[] = [];
  for (const playerId of roster.squad) {
    const player = playerById.get(playerId);
    if (!player) continue;

    const rule = roster.replacements?.find((r) => r.outgoingId === playerId);
    const replacement = rule ? playerById.get(rule.incomingId) : undefined;
    rows.push({
      player,
      originalId: playerId,
      replacedBy: replacement,
    });

    if (replacement) {
      rows.push({
        player: replacement,
        originalId: playerId,
        replacementFor: player,
      });
    }
  }
  return rows;
}

export function latestScoredEventId(store: ScoresStore): number {
  return Math.max(0, ...Object.keys(store.matches).map((eventId) => Number(eventId)));
}
