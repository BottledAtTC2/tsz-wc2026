import Link from "next/link";
import { pools } from "../data/pools";

/**
 * Pool selector rendered as links (`?pool=<id>`), so the choice is shareable
 * and the page stays server-rendered. `basePath` is the current route.
 */
export default function PoolTabs({
  basePath,
  active,
}: {
  basePath: string;
  active: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {pools.map((pool) => (
        <Link
          key={pool.id}
          href={`${basePath}?pool=${pool.id}`}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            active === pool.id
              ? "bg-brand text-navy"
              : "bg-panel2 text-muted hover:text-ink"
          }`}
        >
          {pool.name}
        </Link>
      ))}
    </div>
  );
}

/** Resolve the selected pool id from a page's searchParams, with a default. */
export function resolvePool(pool: string | string[] | undefined): string {
  const fallback = pools[0]?.id ?? "";
  if (Array.isArray(pool)) return pool[0] ?? fallback;
  return pool ?? fallback;
}
