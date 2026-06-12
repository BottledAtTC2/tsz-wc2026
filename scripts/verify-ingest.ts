// Offline verification of the scoring pipeline against hand-computed totals.
// Compile + run:  npx tsc scripts/verify-ingest.ts --outDir .tmp-verify \
//   --module commonjs --target es2020 --moduleResolution node \
//   --esModuleInterop --resolveJsonModule --skipLibCheck
//   && node .tmp-verify/scripts/verify-ingest.js

import { scoreEvent } from "../app/lib/sofascore/ingest";
import type { SofaMatchBundle } from "../app/lib/sofascore/types";

let failures = 0;
function check(name: string, actual: unknown, want: unknown) {
  const ok = actual === want;
  if (!ok) failures++;
  console.log(`${ok ? "✓" : "✗"} ${name}: got ${actual}, want ${want}`);
}

// --- Scenario 1: Argentina vs Spain — scoring, clean sheet, cards, captain ---
const argSpain: SofaMatchBundle = {
  event: {
    id: 9999,
    homeTeam: { name: "Argentina" },
    awayTeam: { name: "Spain" },
    homeScore: { normaltime: 2 },
    awayScore: { normaltime: 1 },
    status: { type: "finished" },
  },
  lineups: {
    home: {
      players: [
        {
          // Zeeshan captain, FWD.
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
          player: { id: 2, name: "Nahuel Molina" },
          substitute: false,
          statistics: {
            minutesPlayed: 60,
            accuratePass: 50,
            totalTackle: 2,
            interceptionWon: 1,
          },
        },
        {
          // Jemin GK, full match → concedes the 75' goal, no clean sheet.
          player: { id: 3, name: "Emiliano Martinez" },
          substitute: false,
          statistics: { minutesPlayed: 90, saves: 4, penaltySave: 1 },
        },
      ],
    },
    away: {
      players: [
        {
          // Tanmay captain, FWD, scores and picks up a yellow.
          player: { id: 4, name: "Lamine Yamal" },
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

const r1 = scoreEvent(argSpain);
const by1 = new Map(r1.players.map((p) => [p.playerId, p]));

check("messi (FWD ×2 captain)", by1.get("messi")?.total, 192);
check("molina (DEF clean sheet)", by1.get("molina")?.total, 46);
check("emi-martinez (GK conceded 1)", by1.get("emi-martinez")?.total, 76);
check("yamal (FWD ×2 captain, yellow)", by1.get("yamal")?.total, 80);
check("scored player count", r1.players.length, 4);
check("team zeeshan total", (by1.get("messi")!.total + by1.get("molina")!.total), 238);
check("molina clean sheet", by1.get("molina")?.stats.cleanSheet ? 1 : 0, 1);
check("emi-martinez conceded", by1.get("emi-martinez")?.stats.goalsConceded, 1);
check("yamal yellow", by1.get("yamal")?.stats.yellowCards, 1);
check("unresolved has Random Person", r1.unresolved.includes("Random Person") ? 1 : 0, 1);

// --- Scenario 2: cross-country name collisions must NOT match (the bug) ---
const mexRSA: SofaMatchBundle = {
  event: {
    id: 8888,
    homeTeam: { name: "Mexico" },
    awayTeam: { name: "South Africa" },
    homeScore: { normaltime: 2 },
    awayScore: { normaltime: 0 },
    status: { type: "finished" },
  },
  lineups: {
    home: {
      players: [
        {
          player: { id: 10, name: "Raul Jimenez" }, // Mexican, drafted → scores
          substitute: false,
          statistics: { minutesPlayed: 90, goals: 1 },
        },
        {
          player: { id: 11, name: "Diego Alvarez" }, // Mexican → must NOT be Julián Álvarez
          substitute: false,
          statistics: { minutesPlayed: 90, goals: 1 },
        },
      ],
    },
    away: {
      players: [
        {
          player: { id: 12, name: "Aubrey Williams" }, // S.African → must NOT be Nico Williams
          substitute: false,
          statistics: { minutesPlayed: 90 },
        },
      ],
    },
  },
  incidents: { incidents: [] },
};

const r2 = scoreEvent(mexRSA);
const ids2 = new Set(r2.players.map((p) => p.playerId));

check("collision: only Raúl Jiménez scored", r2.players.length, 1);
check("collision: raul-jimenez present", ids2.has("raul-jimenez") ? 1 : 0, 1);
check("collision: julian-alvarez NOT matched", ids2.has("julian-alvarez") ? 1 : 0, 0);
check("collision: nico-williams NOT matched", ids2.has("nico-williams") ? 1 : 0, 0);

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
