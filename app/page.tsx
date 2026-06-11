import Link from "next/link";
import { teams } from "./data/teams";
import { pools } from "./data/pools";
import { players } from "./data/players";
import { fixtures } from "./data/fixtures";

const cards = [
  {
    href: "/leaderboard",
    title: "Leaderboard",
    desc: "Standings by pool, ranked on fantasy points.",
  },
  { href: "/teams", title: "Teams", desc: "Every fantasy team and its squad." },
  { href: "/players", title: "Players", desc: "World Cup players and points." },
  { href: "/fixtures", title: "Fixtures", desc: "The World Cup 2026 schedule." },
  { href: "/rules", title: "Rules", desc: "How fantasy points are scored." },
];

export default function Home() {
  const stats = [
    { label: "Teams", value: teams.length },
    { label: "Pools", value: pools.length },
    { label: "Players", value: players.length },
    { label: "Fixtures", value: fixtures.length },
  ];

  return (
    <main>
      <section className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          TSZ <span className="text-emerald-400">World Cup 2026</span>
        </h1>
        <p className="mt-2 text-zinc-400">
          Fantasy league tracker for the 2026 FIFA World Cup.
        </p>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div className="text-2xl font-bold text-emerald-400">{s.value}</div>
            <div className="text-sm text-zinc-400">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-emerald-500/50 hover:bg-zinc-900"
          >
            <div className="text-lg font-semibold">{c.title}</div>
            <div className="mt-1 text-sm text-zinc-400">{c.desc}</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
