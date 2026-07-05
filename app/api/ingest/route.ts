// Ingest one Sofascore match into fantasy points.
//
//   POST /api/ingest
//     body: a Sofascore bundle { event, lineups, incidents }
//        or { file: "/abs/path/to/scraper/match.json" }   (read from disk)
//        or { ...bundle, dryRun: true }                   (compute, don't save)
//
//   GET  /api/ingest   → current team point totals
//
// The match JSON is produced by the Python scraper (tunjayoff/sofascore_scraper),
// which handles Sofascore's TLS-fingerprint anti-bot via curl_cffi.

import { NextResponse, type NextRequest } from "next/server";
import { readFileSync } from "node:fs";
import { revalidatePath } from "next/cache";
import { scoreEvent } from "../../lib/sofascore/ingest";
import { saveMatchResult, teamPointsMap } from "../../lib/scores";
import { loadIdMap, recordIds } from "../../lib/sofascore/learnedIds";
import type { SofaMatchBundle } from "../../lib/sofascore/types";

/** Coerce a variety of scraper output shapes into a SofaMatchBundle. */
function normalizeBundle(raw: unknown): SofaMatchBundle | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, any>;

  const event = r.event ?? (r.id && r.homeTeam ? r : undefined);
  if (!event?.id) return null;

  const lineups = r.lineups ?? (r.home || r.away ? r : undefined);
  if (!lineups?.home && !lineups?.away) return null;

  const incidentsRaw = r.incidents;
  const incidents = Array.isArray(incidentsRaw)
    ? { incidents: incidentsRaw }
    : (incidentsRaw ?? { incidents: [] });

  return { event, lineups, incidents };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  let raw: unknown = body;
  if (typeof body.file === "string") {
    try {
      raw = JSON.parse(readFileSync(body.file, "utf8"));
    } catch (e) {
      return NextResponse.json(
        { error: `cannot read file: ${(e as Error).message}` },
        { status: 400 },
      );
    }
  }

  const bundle = normalizeBundle(raw);
  if (!bundle) {
    return NextResponse.json(
      { error: "could not find event/lineups/incidents in payload" },
      { status: 422 },
    );
  }

  const result = scoreEvent(bundle, loadIdMap());
  const dryRun = body.dryRun === true;
  let learned = 0;
  if (!dryRun) {
    saveMatchResult(result);
    learned = recordIds(
      result.players.map((p) => ({
        sofascoreId: p.sofascoreId,
        playerId: p.playerId,
      })),
    );
    revalidatePath("/", "layout");
  }

  return NextResponse.json({
    saved: !dryRun,
    eventId: result.eventId,
    match: `${result.home} ${result.homeScore ?? "-"}–${result.awayScore ?? "-"} ${result.away}`,
    scoredPlayers: result.players.length,
    learnedIds: learned,
    players: result.players
      .sort((a, b) => b.total - a.total)
      .map((p) => ({ player: p.name, team: p.teamId, role: p.role, total: p.total })),
    // Diagnostics — check these each match to catch silent name mismatches.
    unmatchedDrafted: result.unmatchedDrafted,
    unresolvedLineup: result.unresolved,
    teamPoints: Object.fromEntries(teamPointsMap()),
  });
}

export async function GET() {
  return NextResponse.json({ teamPoints: Object.fromEntries(teamPointsMap()) });
}
