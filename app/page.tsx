import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">
        TSZ World Cup 2026
      </h1>

      <div className="grid gap-4">
        <Link
          href="/leaderboard"
          className="p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800"
        >
          Leaderboard
        </Link>

        <Link
          href="/teams"
          className="p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800"
        >
          Teams
        </Link>

        <Link
          href="/players"
          className="p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800"
        >
          Players
        </Link>

        <Link
          href="/fixtures"
          className="p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800"
        >
          Fixtures
        </Link>
      </div>
    </main>
  );
}
