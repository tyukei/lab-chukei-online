# lab.chukei — field notes

A walkable lab log site. Not a portfolio. Walk through it.

**Stack:** Qwik City · TypeScript · UnoCSS

---

## Quick start

```sh
pnpm install
pnpm dev
# → http://localhost:5173
```

Arrow keys or click to walk. Approach objects to read them.

---

## Project structure

```
src/
├── routes/
│   └── index.tsx          — single route
├── components/
│   ├── world/
│   │   ├── World.tsx      — state + RAF loop + layout
│   │   ├── Outside.tsx    — outside scene (sign / window / door)
│   │   ├── Inside.tsx     — inside scene (note / desk / terminal / board / archive / intercom)
│   │   └── Avatar.tsx     — the walking figure
│   └── panels/
│       └── ZonePanel.tsx  — overlay panel per zone
├── content/
│   ├── site.ts            — static copy and structure
│   └── zones.ts           — zone positions and world constants
└── generated/
    └── activity-log.json  — auto-generated, committed to repo

content/
└── manual-log.json        — hand-written notes (merged into log)

scripts/
└── update-activity-log.mjs

.github/workflows/
└── weekly-log.yml
```

---

## Zones (9 hotspots)

| zone | world x | section | data source |
|------|---------|---------|-------------|
| sign | 380 | outside | static |
| window | 1050 | outside | static |
| door | 1680 | outside | static |
| note | 2350 | inside | `weekSignal` from log |
| desk | 2920 | inside | `now` from log |
| terminal | 3440 | inside | `running` from log |
| board | 3980 | inside | `questions` from log |
| archive | 4520 | inside | `residue` + case files |
| intercom | 5000 | inside | static (contact) |

---

## Updating content

### Static copy

Edit `src/content/site.ts`. Rebuild or restart dev server.

### Manual notes

Edit `content/manual-log.json`:

```json
{
  "weekSignal": "one sentence about this week",
  "now": ["item 1", "item 2"],
  "running": ["project a", "project b"],
  "questions": ["a question?"],
  "residue": ["abandoned: something", "broken: something else"]
}
```

Fields left as `null` or `[]` will be filled from GitHub activity.

### Weekly log (automated)

Run manually:

```sh
GITHUB_TOKEN=<your_pat> GITHUB_USERNAME=<user> pnpm update-log
```

Or trigger via GitHub Actions → **Weekly Log Update** → Run workflow.

---

## GitHub Actions setup

1. Create a GitHub PAT with `repo:read` scope (or use `GITHUB_TOKEN` if the repo is public and self-contained).
2. Add to repository **Secrets**: `LOG_GITHUB_TOKEN`
3. Add to repository **Variables**:
   - `LOG_GITHUB_USERNAME` — your GitHub username
   - `LOG_ALLOWLIST_REPOS` — optional comma-separated `owner/repo` list to restrict which repos are scanned

The workflow runs every Monday at 11:00 JST and commits the updated `activity-log.json` if anything changed. It can also be triggered manually from the Actions tab with optional dry-run mode.

---

## Time of day

The sky and ambient light change based on **Asia/Tokyo** local time:

| range | label |
|-------|-------|
| 05–10 | morning |
| 11–16 | day |
| 17–20 | evening |
| 21–04 | night |

No server-side personalization — computed once at render time.

---

## Customization

- **Colors / scene primitives:** `uno.config.ts` shortcuts
- **World width / zone positions:** `src/content/zones.ts`
- **Case files (archive):** `src/content/site.ts` → `inside.archive.cases`
- **Contact:** `src/content/site.ts` → `inside.intercom.contact`

---

## Deployment

Any static or SSR host works. For Vercel / Cloudflare Pages, add an adapter:

```sh
pnpm qwik add
# choose your adapter
```

For a fully static export:

```sh
pnpm qwik add static
pnpm build
# output: dist/
```
