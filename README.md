# 🐬 Dolphin Planner

**Course & professor planner built for College of Staten Island students.**
Search the catalog, build a weekly schedule with automatic time-conflict detection, and read (or write) professor reviews — with AI-generated review summaries powered by the Claude API.

> Built by a CSI student who got tired of juggling CUNY Global Search, a spreadsheet, and three Reddit tabs every registration season.

## Features

- **Schedule builder** — add sections to a live weekly grid; picking a second section of the same course swaps it automatically
- **Conflict detection** — server-side algorithm flags any day/time overlaps the moment they happen (striped blocks = clash)
- **Professor reviews** — community-submitted ratings, difficulty scores, and write-ups, stored in a normalized SQLite schema
- **AI summaries** — one tap condenses all of a professor's reviews into a balanced 2–3 sentence take (Claude API, with a graceful fallback when no API key is configured)

## Stack

| Layer    | Tech                                          |
| -------- | --------------------------------------------- |
| Frontend | React 18 + Vite                               |
| Backend  | Node.js + Express                             |
| Database | SQLite via Node's built-in `node:sqlite` (raw SQL) |
| AI       | Anthropic Claude API                          |
| Tests    | Node's built-in test runner (`node --test`)   |

## Quickstart

Requires **Node.js ≥ 22.5** (uses the built-in `node:sqlite` module — no native deps to compile).

```bash
npm install        # root tooling (concurrently)
npm run setup      # installs server + client deps
npm run dev        # API on :3001, app on :5173
```

Optional — enable AI summaries:

```bash
cp server/.env.example server/.env
# add your ANTHROPIC_API_KEY (console.anthropic.com)
```

Run tests:

```bash
npm test
```

## How conflict detection works

Sections store meeting days (`"Mon,Wed"`) and times as minutes-from-midnight integers. Two sections conflict when they share at least one day **and** `startA < endB && startB < endA`. The check runs pairwise across the selected schedule on every change — see [`server/src/conflicts.js`](server/src/conflicts.js) and its tests.

## API

| Method | Route                        | Purpose                              |
| ------ | ---------------------------- | ------------------------------------ |
| GET    | `/api/courses?q=`            | Search courses by code or title      |
| GET    | `/api/courses/:id`           | Course detail + sections + ratings   |
| GET    | `/api/professors/:id`        | Professor stats + reviews            |
| POST   | `/api/reviews`               | Submit a review                      |
| POST   | `/api/schedule/check`        | Conflict-check a set of section ids  |
| POST   | `/api/ai/summarize/:profId`  | Claude summary of a prof's reviews   |

## Roadmap

- [ ] Import the real CSI course catalog (CUNY Global Search data)
- [ ] Student auth (CUNY email verification) so reviews are one-per-student
- [ ] Deploy: API on Render, frontend on Vercel, Postgres on Neon
- [ ] "Plan my semester" — describe constraints in plain English, get AI-suggested conflict-free schedules
- [ ] Saved/shareable schedules

## Data sources

- **Courses & degree-map terms**: the official CSI CS course list ([cs.csi.cuny.edu/courses.html](http://www.cs.csi.cuny.edu/courses.html)) and the Computer Science BS Sample Degree Map. Verify elective credits against the undergraduate catalog.
- **Faculty roster**: the department's public directory ([cs.csi.cuny.edu/people.html](http://www.cs.csi.cuny.edu/people.html)) — 15 full-time faculty plus adjuncts.
- **Sections**: seeded times are placeholders under "Staff (TBA)". Import the real semester from CUNY Global Search:

```bash
# fill server/data/schedule.csv from globalsearch.cuny.edu, then
cd server && node scripts/import-schedule.js --semester "Fall 2026" --replace
```

## Why reviews aren't scraped from RateMyProfessors

RMP's terms don't allow scraping or republishing their content, and reviews belong to the students who wrote them. So this app collects **first-party reviews** from CSI students and links each professor to their RMP search results (school id 225) for history instead. All seeded professors start with zero reviews — real ones come from real classmates.

---

MIT © Hatem Alkhatib
