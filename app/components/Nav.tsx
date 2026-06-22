"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/teams", label: "Teams" },
  { href: "/drafts", label: "Drafts" },
  { href: "/players", label: "Players" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/rules", label: "Rules" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex flex-col font-sans shadow-sm">
      
      {/* Top Navigation Bar: Uses standard Tailwind to match the white reference UI */}
      <div className="border-b border-edge bg-white text-black">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4">
          
          <div className="flex items-center overflow-x-auto no-scrollbar">
            {/* Brand Logo Area */}
            <Link
              href="/"
              className="mr-8 shrink-0 py-4 text-xl font-black tracking-tighter"
            >
              TSZ <span className="text-muted">WC26</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2 md:gap-6">
              {links.map((l) => {
                const active = pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`shrink-0 border-b-[4px] px-2 py-4 text-[14px] font-bold uppercase tracking-wide transition-colors ${
                      active
                        ? "border-black text-black"
                        : "border-transparent text-muted hover:border-gray-300 hover:text-black"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right-side dropdown mimic (from reference image) */}
          <div className="hidden shrink-0 cursor-pointer items-center text-[14px] font-bold md:flex">
            TSZ Fantasy <span className="ml-1 text-xs opacity-60">▼</span>
          </div>

        </nav>
      </div>

      {/* Secondary Sponsor Bar: Now strictly using globals.css tokens */}
      <div className="flex w-full items-center justify-center bg-panel py-2 text-xs font-bold tracking-widest text-ink">
        POWERED BY
        <span 
          className="ml-2 rounded-sm bg-accent px-2 py-0.5 text-ink shadow-sm"
          title="Owned by Smayan, Chaitanya, and Rathin"
        >
          THE SLEDGE ZONE
        </span>
      </div>
      
    </header>
  );
}
