# TypeFlow ⌨️

A modern, production-oriented typing test inspired by **Monkeytype** and
**10FastFingers** — real-time typing engine, deep statistics, themes,
leaderboards, achievements and analytics.

Built with **Next.js 15 · TypeScript · Tailwind · shadcn/ui · Prisma ·
PostgreSQL · NextAuth · Zustand · Recharts · Docker**.

---

## Features

- **Typing engine** — real-time per-character validation, smooth animated caret,
  correct/incorrect/extra highlighting. Modes: **time, words, quote, custom,
  numbers, punctuation, zen, infinite**.
- **Statistics** — WPM, raw WPM, accuracy, consistency, error count, keystrokes,
  per-second live graph (Recharts).
- **Configuration** — 15 / 30 / 60 / 120s + infinite, word counts, quote lengths.
- **Accounts** — email/password + Google OAuth, profiles, avatars.
- **History & analytics** — every test saved, personal bests, daily/lifetime
  aggregates, progress charts.
- **Leaderboards** — daily / weekly / monthly / all-time per category.
- **Achievements** — unlockable milestones.
- **Themes** — 8 presets driven by CSS variables, command palette (Ctrl+K),
  keyboard shortcuts, responsive & accessible.
- **Security** — server-side recomputation + anti-cheat, rate limiting, zod
  validation, hardened headers.
- **Admin** — overview dashboard with flagged-result moderation.

> See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full system design,
> ERD and folder structure, and the roadmap (realtime multiplayer, full admin
> CRUD, keyboard heatmap).

---

## Quick start

### Prerequisites
- Node.js 20+ (22 recommended)
- A PostgreSQL database — or Docker for the bundled one

### 1. Install

```bash
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is used because a few libraries still declare React 18
> peers against this project's React 19.

### 2. Configure

```bash
cp .env.example .env
# set DATABASE_URL and NEXTAUTH_SECRET (openssl rand -base64 32)
```

### 3. Database

Start Postgres (if you don't have one):

```bash
docker compose up -d db
```

Apply the schema and seed demo content:

```bash
npm run db:push
npm run db:seed
```

### 4. Run

```bash
npm run dev
# http://localhost:3000
```

**Demo login:** `admin@typeflow.dev` / `admin12345`

---

## Run everything in Docker

```bash
cp .env.example .env
docker compose up --build
# app: http://localhost:3000
docker compose exec app node_modules/.bin/prisma db seed   # optional
```

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm start` | Start the production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Push the Prisma schema to the DB |
| `npm run db:migrate` | Create/apply a dev migration |
| `npm run db:seed` | Seed achievements, content & demo data |
| `npm run db:studio` | Open Prisma Studio |

---

## Project layout

```
prisma/        schema (ERD) + seed
src/app/       routes (pages + API route handlers)
src/components/ ui primitives, typing engine, layout, charts
src/lib/       prisma, auth, stats, words, themes, validation, anti-cheat
src/store/     Zustand stores (config + typing engine)
docs/          architecture & deployment guides
```

---

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for Vercel + Railway/Neon and
Docker instructions.

---

## License

MIT — do whatever you like.
