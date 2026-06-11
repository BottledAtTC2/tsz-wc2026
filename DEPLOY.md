# Running & deploying TSZ World Cup 2026

## Run locally

```bash
npm install        # first time only
npm run dev        # http://localhost:3000 (hot reload)
# or production mode:
npm run build && npm run start
```

## Ingest a match (compute fantasy points)

Sofascore fingerprints TLS, so fetching is done by the Python scraper
([tunjayoff/sofascore_scraper](https://github.com/tunjayoff/sofascore_scraper),
which uses `curl_cffi`), **not** this app. The app only scores the JSON.

1. Run the scraper to download a finished match (`event` + `lineups` +
   `incidents`).
2. POST it to the ingest endpoint:

   ```bash
   # either inline JSON…
   curl -X POST http://localhost:3000/api/ingest \
     -H 'Content-Type: application/json' \
     -d @match.json

   # …or point at a file the scraper wrote:
   curl -X POST http://localhost:3000/api/ingest \
     -H 'Content-Type: application/json' \
     -d '{"file":"/abs/path/to/match.json"}'
   ```

3. The response includes the per-player points **and two diagnostics to
   check every match**:
   - `unmatchedDrafted` — drafted players whose nation played but weren't
     scored. If one of them actually played, their name in `app/data/players.ts`
     doesn't match Sofascore's spelling — fix it and re-ingest.
   - `unresolvedLineup` — featured lineup names that matched none of our
     players.

Points are written to `data/scores.json` and read live by the site.

## Deploy to Render (so friends can view it)

Friends only **view** the site — they don't run anything. Deploy once, share
the URL.

1. Push this repo to GitHub (Render deploys from a Git repo).
2. In Render: **New → Blueprint**, select the repo. It reads `render.yaml`
   and creates a free Node web service (build `npm run build`, start
   `npm run start`). Or create a Web Service manually with those commands.
3. Pick the branch to deploy. Done — Render gives you a `*.onrender.com` URL.

> Free instances sleep when idle and take a few seconds to wake — same as the
> reference sites.

## Changing things after deploy

- **Code / rosters / styling:** edit → commit → push. Render auto-redeploys.
  Nothing is locked in.
- **Match points:** `data/scores.json` written on the server is **ephemeral**
  on Render's free plan (wiped on each redeploy). So the durable workflow is to
  **ingest locally, then commit the data**:

  ```
  run scraper → POST to localhost:3000/api/ingest → git add data/scores.json
              → git commit → git push   (Render redeploys with the new points)
  ```

  This keeps results versioned in git and means the live server never needs to
  write files. `data/sofascore-ids.json` (learned id map) works the same way —
  commit it to keep matching fast and exact.

## Note: the ingest endpoint is open

`POST /api/ingest` has no auth. That's fine if you only ever ingest on
`localhost`. If you ingest against the public Render URL, anyone who finds it
could overwrite scores — ask to add a secret-token guard before doing that.
