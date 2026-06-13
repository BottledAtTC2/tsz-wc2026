# TSZ World Cup 2026 — Design / UI Handover

This is a guide for anyone changing the **look** of the site (colours, fonts,
graphics, layout, spacing) **without** touching the functionality (scoring,
data, the Sofascore ingest pipeline). Please read the **"Do NOT change"**
section — staying inside those lines guarantees nothing breaks.

---

## 1. What it is (the stack)

- **Next.js 16** (App Router) — a full-stack **React** framework.
- **React 19** — all UI is React components in `.tsx` files (JSX), not HTML files.
- **TypeScript** — typed JavaScript.
- **Tailwind CSS v4** — styling is done with utility classes in `className="..."`
  (e.g. `className="bg-panel text-brand px-4"`), not separate `.css` files.
- **Data**: plain JSON / TypeScript files (no database).

There are two kinds of components:
- **Server components** (default) — render on the server (most pages).
- **Client components** — the file starts with `"use client";` (interactive bits
  like the nav and the admin upload form). **Keep that line.**

## 2. Run it locally (so you can see your changes)

```bash
npm install      # first time only
npm run dev      # opens http://localhost:3000, auto-reloads on save
```

Edit a file, save, and the browser updates instantly.

> **Important gotcha:** if you edit `app/globals.css` (the colour palette) or
> change the font in `app/layout.tsx`, you must **restart** the dev server
> (Ctrl+C, then `npm run dev`) and hard-refresh the browser (Cmd/Ctrl+Shift+R).
> Normal component edits hot-reload fine; only those two files need a restart.

## 3. Where the design lives

| What | File |
|---|---|
| **Colour palette** (whole-site theme) | `app/globals.css` |
| **Fonts** | `app/layout.tsx` |
| **Top navigation bar** | `app/components/Nav.tsx` |
| **Pool switcher tabs** | `app/components/PoolTabs.tsx` |
| Home page | `app/page.tsx` |
| Leaderboard | `app/leaderboard/page.tsx` |
| Teams list | `app/teams/page.tsx` |
| Single team page | `app/team/[id]/page.tsx` |
| Players list | `app/players/page.tsx` |
| Fixtures (schedule) | `app/fixtures/page.tsx` |
| Rules (scoring) | `app/rules/page.tsx` |
| Admin (data upload) | `app/admin/page.tsx` |
| Favicon (tab icon) | `app/icon.svg` (replace with `app/icon.png` to use an image) |
| Static images you add | `public/` folder |

### Changing colours (the easiest big win)

The brand palette is defined once at the top of `app/globals.css`:

```css
@theme {
  --color-navy: #0a111f;     /* page background        */
  --color-panel: #131d30;    /* cards / rows           */
  --color-panel2: #1a2740;   /* headers / hover        */
  --color-edge: #263651;     /* borders                */
  --color-brand: #2ea6ff;    /* primary accent (blue)  */
  --color-accent: #ff7a1a;   /* secondary accent (orange) */
  --color-ink: #eef3fa;      /* main text              */
  --color-muted: #8696b0;    /* secondary text         */
}
```

Change a hex value here and the **whole site** recolours. In the components,
these are used as Tailwind classes: `bg-navy`, `bg-panel`, `text-brand`,
`text-accent`, `border-edge`, `text-muted`, etc. You can also use any standard
Tailwind colour (e.g. `bg-red-500`, `text-white`) anywhere.

### Changing fonts

In `app/layout.tsx`, the font is imported from `next/font/google`. Swap the
import name (e.g. `Inter`, `Montserrat`, `Archivo`) and update the two places
it's referenced. The body font stack is set in `app/globals.css`.

### Adding graphics / images

Drop image files into the **`public/`** folder and reference them by path,
e.g. `<img src="/my-logo.png" />` or Next's `<Image>` component. Country flags
and club crests can be added this way too.

## 4. The pages and their interactive bits ("buttons")

- **Top nav** (`Nav.tsx`): links to Leaderboard, Teams, Players, Fixtures, Rules.
  The active link is highlighted. Restyle freely, but **keep each `href`**.
- **Pool tabs** (`PoolTabs.tsx`): "TSZ Pool" / "CCO Pool" buttons. They're links
  that set `?pool=tsz` or `?pool=cco` in the URL. Keep that behaviour.
- **Leaderboard**: a ranked table (Rank / Team / Last / Total). Each **row is a
  link** to that team's page. Restyle the table; keep the link and the data
  fields (`team.name`, `pts`, etc.).
- **Teams**: cards, each links to a team page.
- **Team page**: squad grouped by position, captain (C) / vice (VC) badges,
  points per player, and a match-by-match breakdown.
- **Players**: every player with position, nation, owning team chip(s), and
  points.
- **Fixtures**: the schedule grouped by date with kickoff times and scores.
- **Rules**: the fantasy points table (auto-generated from the scoring config).
- **Admin** (`/admin`): two upload tools — "Ingest a match" (file/paste +
  **Ingest** button) and "Load fixtures" (file upload). **This is the data-entry
  engine — do not change its logic.** You may restyle the inputs/buttons.

## 5. ✅ Safe to change vs ❌ Do NOT change

### ✅ Safe (this is your playground)
- Any `className="..."` values (colours, spacing, sizing, layout, rounded
  corners, shadows, grid/flex arrangement).
- The colour tokens in `app/globals.css`.
- The font in `app/layout.tsx`.
- Adding images/SVG/graphics, icons, the favicon.
- Re-arranging or restyling visual elements **as long as the data placeholders
  stay** (the things in `{curly braces}`, e.g. `{team.name}`, `{pts}`,
  `{p.total}`).
- Adding purely-visual markup (wrappers, decorative divs, headings).

### ❌ Do NOT change (this is the functionality)
- **Anything in `app/lib/`** — scoring engine, Sofascore ingest, data loading.
- **Anything in `app/api/`** — the upload/ingest endpoints.
- **Anything in `app/data/`** — players, teams, pools (the league roster data).
- **The `data/*.json` files** — live scores, fixtures, learned ids.
- **The `scripts/` folder** — the data-grabbing tools.
- The `"use client";` line at the top of any file that has it.
- The values inside `{curly braces}` in the JSX (those pull in real data) and
  the `href`/`Link` destinations.
- `key={...}` props on list items.
- File names and exported function names. Don't rename or move files.
- The logic in `app/admin/page.tsx` (the upload/fetch code) — restyle only.

**Rule of thumb:** change how it *looks* (classes, colours, images, layout),
never how it *works* (the JavaScript/TypeScript logic, the `{...}` data, the
routes). If you're touching anything outside a `className` or `globals.css`,
pause and check.

## 6. Publishing changes

Edits are only on the local machine until pushed:

```bash
git add -A
git commit -m "UI: <what you changed>"
git push
```

The site is hosted on **Render**, which redeploys automatically on push.

## 7. If something breaks

Run `npm run build`. If it prints errors, the last edit broke something
(usually a deleted `{...}` placeholder or a removed import). Undo that edit, or
`git checkout -- <file>` to revert a file to the last commit.
