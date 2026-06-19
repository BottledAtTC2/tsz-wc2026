# Managing the league (rosters, captains, names)

Everything here is editing two files:

- **`app/data/teams.ts`** — the fantasy teams: their name, squad, captain, vice.
- **`app/data/players.ts`** — the real players (only touched when adding a brand-new one).

After any edit: run `npm run dev`, check it at http://localhost:3000, then
`git add -A && git commit -m "..." && git push` to put it live on Render.

> **Golden rule:** never change an `id` (of a team or a player). Ids link the
> squads, scores, and URLs together. You can freely change a `name`.

A team in `teams.ts` looks like this:

```ts
{
  id: "kanha",                 // ← NEVER change this
  name: "Kanha",               // ← team name (safe to change)
  poolId: "cco",
  squad: [
    "emi-martinez", "upamecano", "pacho", "stanisic", "bruno-fernandes",
    "de-bruyne", "dani-olmo", "rashford", "luis-diaz", "son", "pulisic",
  ],
  captainId: "bruno-fernandes",   // ← the captain's player id
  viceCaptainId: "luis-diaz",     // ← the vice's player id
  points: 0,
},
```

The quoted things like `"luis-diaz"` are **player ids** — the lowercase,
dash-separated version of a name. To find a player's exact id, open
`app/data/players.ts` and search (Cmd+F) for their name; the `id:` next to it is
what you use.

---

## 1. Change captain / vice-captain (e.g. injury)

In that team's block, change `captainId` and/or `viceCaptainId` to the new
player's id. **The id must be one already in that team's `squad`.**

```ts
captainId: "bruno-fernandes",
viceCaptainId: "rashford",   // changed the vice from luis-diaz to rashford
```

> Captain = 2× points, vice = 1.5×. If you change this **mid-tournament**,
> already-scored matches keep the old multiplier until you **re-ingest** them
> on `/admin`. Future matches use the new captain/vice automatically.

---

## 2. Replace an injured player with someone else

In the team's `squad` list, swap the injured player's id for the replacement's
id. If they were captain/vice, update `captainId`/`viceCaptainId` too.

```ts
squad: [
  "emi-martinez", "upamecano", "pacho", "stanisic", "bruno-fernandes",
  "de-bruyne", "dani-olmo", "rashford", "luis-diaz", "son", "leao",
  //                                                  injured ^^^ replaced with "leao"
],
```

**If the replacement is already a player in `players.ts`** (very likely — most
big names are there), just use their id. Done.

**If the replacement is a brand-new player** not in `players.ts` yet, add a line
to `players.ts` first, then use that id in the squad:

```ts
{ id: "new-player-id", name: "Full Name", country: "Country", position: "MID", club: "Club" },
```

- `id`: lowercase, dashes instead of spaces, no accents (e.g. `"rafael-leao"`).
- `position`: one of `"GK"`, `"DEF"`, `"MID"`, `"FWD"`.
- `country`: must match how Sofascore spells the nation (e.g. `"USA"`,
  `"South Korea"`, `"Turkey"`) so their stats match.
- If Sofascore uses a nickname for them, add `aliases: ["Nickname"]` (like Bono).

---

## Add a new pool

Two data edits, no code changes — the pool tab, leaderboard, and scoring all
pick it up automatically.

**Step 1 — define the pool** in `app/data/pools.ts`:

```ts
export const pools: Pool[] = [
  { id: "tsz", name: "TSZ Pool", countTop: 10 },
  { id: "cco", name: "CCO Pool" },
  { id: "third", name: "Third Pool", countTop: 10 },   // ← new
];
```

- `id`: a short, unique, lowercase slug (used in the URL, e.g. `?pool=third`).
  Never reuse an existing id.
- `name`: the tab label shown on the site.
- `countTop`: `10` = only the best 10 of 11 players count. **Leave the field
  out entirely** to count all 11 (like the CCO Pool).

**Step 2 — add that pool's teams** in `app/data/teams.ts`, each with
`poolId: "third"` (matching the new id). Copy the shape of an existing team:

```ts
{
  id: "some-unique-team-id",
  name: "Team Name",
  poolId: "third",
  squad: [ "player-id-1", "player-id-2", /* …11 player ids… */ ],
  captainId: "player-id-1",
  viceCaptainId: "player-id-2",
  points: 0,
},
```

- If any team drafts a player not already in `players.ts`, **add that player
  first** (see "Replace an injured player" above for the format).
- The same real player can be in multiple pools — that's fine, scoring handles it.

That's it. Run `npm run dev`, the new tab appears on Leaderboard/Teams, then
commit and push.

## 3. Change a team's name

Change the `name` field only. **Leave `id` alone.**

```ts
id: "kanha",            // unchanged
name: "Kanha United",   // new display name
```

---

## After editing — checks & publish

1. `npm run dev` → look at the team page to confirm it looks right.
2. If something looks broken, run `npm run build`. An error usually means a
   typo'd id, or a missing comma/quote — fix that line.
3. `git add -A && git commit -m "Roster: <what changed>" && git push`
   → Render redeploys automatically.

> A squad should always have **11 players**, and the captain/vice ids must be
> among those 11. If you re-grab/re-ingest after a change, the new
> captain/vice and replacement will be reflected in the points.
