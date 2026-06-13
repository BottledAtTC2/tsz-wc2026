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
    <main className="font-sans">
      
      {/* Hero Section: Massive typography and high contrast */}
      <section className="relative mb-8 overflow-hidden rounded-2xl border-2 border-edge bg-panel p-8 shadow-2xl md:p-12">
        {/* Subtle background glow effect using your brand color */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/5 blur-3xl"></div>
        
        <h1 className="relative z-10 text-5xl font-black uppercase tracking-tighter text-ink md:text-7xl">
          TSZ <span className="text-brand">World Cup</span> <br className="hidden md:block" />
          <span className="text-muted">2026</span>
        </h1>
        
        <p className="relative z-10 mt-6 max-w-xl border-l-4 border-brand pl-4 text-[15px] font-bold uppercase tracking-widest text-muted md:text-lg">
          The Sledge Zone fantasy league for the 2026 FIFA World Cup.
        </p>
      </section>

      {/* Navigation Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-edge bg-panel p-6 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-brand/50 hover:bg-panel2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <div>
              <div className="text-2xl font-black uppercase tracking-wide text-ink transition-colors group-hover:text-brand">
                {c.title}
              </div>
              <div className="mt-3 text-[13px] font-bold uppercase tracking-wider text-muted leading-relaxed">
                {c.desc}
              </div>
            </div>
            
            {/* Interactive "Action" Indicator */}
            <div className="mt-8 flex items-center justify-end">
              <span className="flex items-center gap-2 rounded bg-panel2 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-muted transition-colors group-hover:bg-brand group-hover:text-black">
                Explore <span className="text-[14px]">→</span>
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}