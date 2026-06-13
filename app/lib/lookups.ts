import { pools } from "../data/pools";
import { teams } from "../data/teams";

/** Display name for a pool id, falling back to the id itself. */
export function poolName(poolId: string): string {
  return pools.find((p) => p.id === poolId)?.name ?? poolId;
}

/** Every fantasy team that drafted a given player (one per pool, possibly). */
export function teamsForPlayer(playerId: string) {
  return teams.filter((t) => t.squad.includes(playerId));
}
