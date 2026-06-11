import { pools } from "../data/pools";
import { teams } from "../data/teams";

/** Display name for a pool id, falling back to the id itself. */
export function poolName(poolId: string): string {
  return pools.find((p) => p.id === poolId)?.name ?? poolId;
}

/** Which fantasy team (if any) drafted a given player. */
export function teamForPlayer(playerId: string) {
  return teams.find((t) => t.squad.includes(playerId));
}
