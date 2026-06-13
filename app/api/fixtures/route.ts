// Load the World Cup schedule from Sofascore events.
//
//   POST /api/fixtures   body: a Sofascore events list — { events: [...] } or
//                              a raw [...] array (from the grab-fixtures snippet)
//   GET  /api/fixtures   → how many fixtures are stored
//
// Each Sofascore event is mapped to our Fixture shape and saved to
// data/fixtures.json (read live by the Fixtures page).

import { NextResponse, type NextRequest } from "next/server";
import { loadFixtures, saveFixtures } from "../../lib/fixtures";
import type { Fixture, FixtureStatus } from "../../data/types";

function mapStatus(type?: string): FixtureStatus {
  if (type === "finished") return "finished";
  if (type === "inprogress") return "live";
  return "scheduled";
}

function stageOf(ev: any): string {
  const r = ev.roundInfo;
  if (r?.name) return r.name;
  if (r?.round) return `Round ${r.round}`;
  return "Group stage";
}

function toFixture(ev: any): Fixture | null {
  if (!ev?.id || !ev.homeTeam || !ev.awayTeam) return null;
  const ts = ev.startTimestamp ? ev.startTimestamp * 1000 : 0;
  return {
    id: String(ev.id),
    stage: stageOf(ev),
    home: ev.homeTeam.name ?? "TBD",
    away: ev.awayTeam.name ?? "TBD",
    kickoff: ts ? new Date(ts).toISOString() : "",
    venue: ev.venue?.stadium?.name,
    homeScore: ev.homeScore?.current ?? ev.homeScore?.normaltime,
    awayScore: ev.awayScore?.current ?? ev.awayScore?.normaltime,
    status: mapStatus(ev.status?.type),
    sofascoreId: ev.id,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const events: unknown[] = Array.isArray(body)
    ? body
    : Array.isArray(body?.events)
      ? body.events
      : [];
  if (events.length === 0) {
    return NextResponse.json(
      { error: "no events found — expected an array or { events: [...] }" },
      { status: 422 },
    );
  }

  // Merge with what's already stored so multiple grabs accumulate; newest wins.
  const byId = new Map<string, Fixture>();
  for (const f of loadFixtures()) byId.set(f.id, f);
  let added = 0;
  for (const ev of events) {
    const f = toFixture(ev);
    if (!f) continue;
    if (!byId.has(f.id)) added++;
    byId.set(f.id, f);
  }

  const fixtures = [...byId.values()].sort((a, b) =>
    a.kickoff.localeCompare(b.kickoff),
  );
  saveFixtures(fixtures);

  return NextResponse.json({
    total: fixtures.length,
    added,
    finished: fixtures.filter((f) => f.status === "finished").length,
  });
}

export async function GET() {
  return NextResponse.json({ total: loadFixtures().length });
}
