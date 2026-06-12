"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/rules", label: "Rules" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-edge bg-navy/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4">
        <Link
          href="/"
          className="mr-4 shrink-0 py-3.5 text-lg font-extrabold tracking-tight"
        >
          TSZ <span className="text-brand">WC</span>
          <span className="text-accent">26</span>
        </Link>
        {links.map((l) => {
          const active = pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`shrink-0 border-b-2 px-3 py-3.5 text-sm font-semibold transition-colors ${
                active
                  ? "border-brand text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
