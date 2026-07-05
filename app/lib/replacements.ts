import type { PlayerId, ReplacementRule } from "../data/types";
import { loadFixtures } from "./fixtures";
import type { CaptainRole } from "./scoring";

export interface ReplaceableRoster {
  squad: PlayerId[];
  replacements?: ReplacementRule[];
  captainId?: PlayerId;
  viceCaptainId?: PlayerId;
}

export function replacementHasStarted(
  rule: ReplacementRule,
  eventId: number,
): boolean {
  if (rule.scoringEventIds) return rule.scoringEventIds.includes(eventId);
  if (rule.startsEventId != null) {
    return compareEventOrder(eventId, rule.startsEventId) >= 0;
  }
  if (rule.startsAfterEventId != null) {
    return compareEventOrder(eventId, rule.startsAfterEventId) > 0;
  }
  return false;
}

export function activePlayerForSlot(
  roster: ReplaceableRoster,
  outgoingId: PlayerId,
  eventId: number,
): PlayerId {
  const rule = roster.replacements
    ?.filter((r) => r.outgoingId === outgoingId && replacementHasStarted(r, eventId))
    .sort((a, b) => replacementStartOrder(b) - replacementStartOrder(a))[0];
  return rule?.incomingId ?? outgoingId;
}

function replacementStartOrder(rule: ReplacementRule): number {
  if (rule.startsEventId != null) return eventOrder(rule.startsEventId) ?? rule.startsEventId;
  if (rule.startsAfterEventId != null) {
    return (eventOrder(rule.startsAfterEventId) ?? rule.startsAfterEventId) + 0.5;
  }
  if (rule.scoringEventIds?.length) {
    return Math.min(
      ...rule.scoringEventIds.map((eventId) => eventOrder(eventId) ?? eventId),
    );
  }
  return Number.NEGATIVE_INFINITY;
}

let fixtureOrder: Map<number, number> | undefined;

function eventOrder(eventId: number): number | undefined {
  if (!fixtureOrder) {
    fixtureOrder = new Map(
      loadFixtures()
        .filter((fixture) => fixture.sofascoreId != null)
        .map((fixture, index) => [fixture.sofascoreId as number, index]),
    );
  }
  return fixtureOrder.get(eventId);
}

function compareEventOrder(eventId: number, cutoffEventId: number): number {
  const eventRank = eventOrder(eventId);
  const cutoffRank = eventOrder(cutoffEventId);
  if (eventRank != null && cutoffRank != null) return eventRank - cutoffRank;
  return eventId - cutoffEventId;
}

function startedReplacementRules(
  roster: ReplaceableRoster,
  eventId: number,
): ReplacementRule[] {
  return (roster.replacements ?? [])
    .filter((r) => replacementHasStarted(r, eventId))
    .sort((a, b) => replacementStartOrder(a) - replacementStartOrder(b));
}

export function captainIdForEvent(
  roster: ReplaceableRoster,
  eventId: number,
): PlayerId | undefined {
  return startedReplacementRules(roster, eventId).reduce(
    (captainId, rule) => rule.newCaptainId ?? captainId,
    roster.captainId,
  );
}

export function viceCaptainIdForEvent(
  roster: ReplaceableRoster,
  eventId: number,
): PlayerId | undefined {
  return startedReplacementRules(roster, eventId).reduce(
    (viceCaptainId, rule) => rule.newViceCaptainId ?? viceCaptainId,
    roster.viceCaptainId,
  );
}

export function activeRosterPlayerIds(
  roster: ReplaceableRoster,
  eventId: number,
): PlayerId[] {
  return roster.squad.map((pid) => activePlayerForSlot(roster, pid, eventId));
}

export function ownsPlayerInEvent(
  roster: ReplaceableRoster,
  playerId: PlayerId,
  eventId: number,
): boolean {
  return activeRosterPlayerIds(roster, eventId).includes(playerId);
}

export function roleForPlayerInEvent(
  roster: ReplaceableRoster,
  playerId: PlayerId,
  eventId: number,
): CaptainRole {
  if (captainIdForEvent(roster, eventId) === playerId) return "captain";
  if (viceCaptainIdForEvent(roster, eventId) === playerId) return "vice";
  return "none";
}
