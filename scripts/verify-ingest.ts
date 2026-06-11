// Offline verification of the scoring pipeline against hand-computed totals.
// Compile + run:  npx tsc scripts/verify-ingest.ts --outDir .tmp-verify \
//   --module commonjs --target es2020 --moduleResolution node \
//   --esModuleInterop --resolveJsonModule --skipLibCheck
//   && node .tmp-verify/scripts/verify-ingest.js

import { scoreEvent } from "../app/lib/sofascore/ingest";
import type { SofaMatchBundle } from "../app/lib/sofascore/types";

const bundle: SofaMatchBundle = {
  event: {
    id: 9999,
    homeTeam: { name: "Test Home" },
    awayTeam: { name: "Test Away" },
    homeScore: { normaltime: 2 },
    awayScore: { normaltime: 1 },
    status: { type: "finished" },
  },
  lineups: {
    home: {
      players: [
        {
          // Zeeshan captain, FWD. Accent-free name to test normalization.
          player: { id: 1, name: "Lionel Messi" },
          substitute: false,
          statistics: {
            minutesPlayed: 90,
            goals: 1,
            goalAssist: 1,
            keyPass: 2,
            onTargetScoringAttempt: 3,
            accuratePass: 40,
          },
        },
        {
          // Zeeshan DEF, subbed off at 60' before the 75' goal → clean sheet.
          player: { id: 2, name: "Pau Cubarsi" },
          substitute: false,
          statistics: {
            minutesPlayed: 60,
            accuratePass: 50,
            totalTackle: 2,
            interceptionWon: 1,
          },
        },
        {
          // Zeeshan GK, full match → concedes the 75' goal, no clean sheet.
          player: { id: 3, name: "Manuel Neuer" },
          substitute: false,
          statistics: { minutesPlayed: 90, saves: 4, penaltySave: 1 },
        },
      ],
    },
    away: {
      players: [
        {
          // Yash captain, FWD, with a yellow card.
          player: { id: 4, name: "Vinicius Junior" },
          substitute: false,
          statistics: { minutesPlayed: 90, goals: 1 },
        },
        {
          // Not drafted → must be ignored.
          player: { id: 5, name: "Random Person" },
          substitute: false,
          statistics: { minutesPlayed: 90, goals: 5 },
        },
      ],
    },
  },
  incidents: {
    incidents: [
      { incidentType: "goal", incidentClass: "regular", isHome: false, time: 75 },
      { incidentType: "card", incidentClass: "yellow", time: 30, player: { id: 4 } },
      { incidentType: "substitution", time: 60, playerOut: { id: 2 } },
    ],
  },
};

const result = scoreEvent(bundle);

const expected: Record<string, number> = {
  messi: 192, // (4+40+20+6+18+8) ×2
  cubarsi: 46, // 4 + 10 + 8 + 4 + 20(clean sheet)
  neuer: 76, // 4 + 24 + 50 − 2(conceded)
  vinicius: 80, // (4 + 40 − 4) ×2
};

let failures = 0;
function check(name: string, actual: number, want: number) {
  const ok = actual === want;
  if (!ok) failures++;
  console.log(`${ok ? "✓" : "✗"} ${name}: got ${actual}, want ${want}`);
}

const byId = new Map(result.players.map((p) => [p.playerId, p]));
for (const [id, want] of Object.entries(expected)) {
  check(id, byId.get(id)?.total ?? NaN, want);
}

// Undrafted player must not appear.
check(
  "undrafted ignored (player count)",
  result.players.length,
  Object.keys(expected).length,
);

// Team aggregation.
const teamTotals = new Map<string, number>();
for (const p of result.players)
  teamTotals.set(p.teamId, (teamTotals.get(p.teamId) ?? 0) + p.total);
check("team zeeshan total", teamTotals.get("zeeshan") ?? NaN, 192 + 46 + 76);
check("team yash total", teamTotals.get("yash") ?? NaN, 80);

// Clean-sheet vs conceded specifics.
check("cubarsi clean sheet", byId.get("cubarsi")?.stats.cleanSheet ? 1 : 0, 1);
check("neuer conceded", byId.get("neuer")?.stats.goalsConceded ?? NaN, 1);
check("vinicius yellow", byId.get("vinicius")?.stats.yellowCards ?? NaN, 1);

// Diagnostics: the undrafted featured player is the only unresolved one;
// the fictional team names match no nation, so no unmatched drafted players.
check("unresolved count", result.unresolved.length, 1);
check(
  "unresolved is Random Person",
  result.unresolved[0] === "Random Person" ? 1 : 0,
  1,
);
check("unmatchedDrafted count", result.unmatchedDrafted.length, 0);

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
