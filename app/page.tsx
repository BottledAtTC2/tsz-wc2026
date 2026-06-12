import Link from "next/link";

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
  return (
    <main>
      <section className="mb-8 overflow-hidden rounded-2xl border border-edge bg-gradient-to-br from-panel2 to-panel p-8">
        <h1 className="text-4xl font-extrabold tracking-tight">
          TSZ <span className="text-brand">World Cup</span>{" "}
          <span className="text-accent">2026</span>
        </h1>
        <p className="mt-2 text-muted">
          The Sledge Zone fantasy league for the 2026 FIFA World Cup.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-edge bg-panel/50 p-5 transition-colors hover:border-brand/60 hover:bg-panel"
          >
            <div className="text-lg font-semibold">{c.title}</div>
            <div className="mt-1 text-sm text-muted">{c.desc}</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
