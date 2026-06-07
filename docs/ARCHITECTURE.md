# AgoyType — Architecture & System Design

> A modern, production-oriented typing-test platform inspired by Monkeytype and
> 10FastFingers. Built with Next.js 15 (App Router), TypeScript, Tailwind,
> shadcn/ui, Prisma + PostgreSQL, NextAuth, Zustand and Recharts.

---

## 1. Requirements Analysis

### 1.1 Functional requirements

| Domain | Capability |
| --- | --- |
| Typing engine | Real-time per-character validation, correct/incorrect highlight, smooth animated caret, modes: words / time / quote / custom / numbers / punctuation / zen |
| Live statistics | WPM, raw WPM, accuracy, consistency, error count, keystrokes, per-second graph |
| Configuration | Durations 15/30/60/120 + custom; word counts 10/25/50/100 + custom |
| Accounts | Email+password register/login, Google OAuth, profile, avatar |
| History | Persist every completed test, personal bests, daily/weekly/monthly/lifetime aggregates |
| Leaderboard | Daily / weekly / monthly / all-time rankings per mode |
| Achievements | Unlockable milestones derived from results |
| Multiplayer | Real-time race rooms, room codes, private rooms, spectators, match history *(scaffolded — see §7)* |
| UI/UX | Dark/light + theme presets + custom theme, responsive, keyboard shortcuts, command palette, a11y |
| Analytics | WPM / accuracy / progress charts, mistyped-words report, keyboard heatmap |
| Admin | User management, leaderboard moderation, word DB management, analytics *(scaffolded — see §7)* |
| Security | Rate limiting, CSRF, input validation, anti-cheat heuristics, bot detection |

### 1.2 Non-functional requirements

- **Performance** — SSR/RSC for content pages, client islands only for the typing
  engine; route-level code splitting; indexed leaderboard queries.
- **Correctness** — the WPM/accuracy maths must match the well-known definitions
  (see `src/lib/stats.ts`) so results are comparable to other tools.
- **Integrity** — results are recomputed/validated server-side; impossible inputs
  are rejected (anti-cheat).
- **Portability** — fully dockerised; runs locally with one `docker compose up`.

---

## 2. High-level Architecture

```
                         ┌─────────────────────────────────────────┐
                         │                Browser                    │
                         │  React 19 client islands                  │
                         │  • Typing engine (Zustand store)          │
                         │  • Live stats + Recharts graph            │
                         │  • Theme engine (CSS variables)           │
                         └───────────────┬───────────────────────────┘
                                         │  fetch / Server Actions
                         ┌───────────────▼───────────────────────────┐
                         │          Next.js 15 (App Router)           │
                         │  • RSC pages (SSR): leaderboard, profile   │
                         │  • Route handlers: /api/results, /api/...   │
                         │  • Middleware: security headers, auth gate  │
                         │  • NextAuth (credentials + Google)          │
                         └───────────────┬───────────────────────────┘
                                         │  Prisma Client
                         ┌───────────────▼───────────────────────────┐
                         │              PostgreSQL                     │
                         │  Users, Results, Leaderboard, Achievements │
                         └────────────────────────────────────────────┘
```

### Rendering strategy

- **Typing test (`/`)** — a client island. All keystroke handling, validation and
  live stats run locally for zero-latency feedback; only the *final* result is
  POSTed to the server.
- **Leaderboard / profile / history** — React Server Components that query Prisma
  directly and stream HTML; charts hydrate as small client islands.
- **Auth** — NextAuth with a JWT session strategy (stateless, edge-friendly) plus
  a Prisma adapter so OAuth accounts are persisted.

---

## 3. Data Model (ERD)

```
┌────────────┐        ┌────────────┐        ┌──────────────┐
│   User     │1──────*│  Result    │*──────1│ (mode/lang)  │
│────────────│        │────────────│        └──────────────┘
│ id         │        │ id         │
│ name       │        │ userId  FK │        ┌──────────────┐
│ email      │        │ wpm        │   1   *│ PersonalBest │
│ password?  │        │ rawWpm     │────────│──────────────│
│ image      │        │ accuracy   │        │ userId  FK   │
│ role       │        │ consistency│        │ mode/key     │
│ bio        │        │ mode       │        │ wpm          │
│ keyboard   │        │ mode2      │        └──────────────┘
└─────┬──────┘        │ language   │
      │1              │ duration   │        ┌──────────────┐
      │               │ rawData(J) │   1   *│ Achievement  │
      *               │ charStats  │────────│ (unlocked)   │
┌────────────┐        │ flagged    │        └──────────────┘
│  Account   │        │ createdAt  │
│ (OAuth)    │        └────────────┘        ┌──────────────┐
└────────────┘                              │ DailyStat    │
┌────────────┐        ┌────────────┐        │ (per user/d) │
│  Session   │        │ RaceRoom   │1──────*│ RaceParticip │
└────────────┘        │ (multipl.) │        └──────────────┘
                      └────────────┘
┌────────────┐        ┌────────────┐
│ WordList   │1──────*│  Quote     │
└────────────┘        └────────────┘
```

### Entities

- **User** — identity + profile + `role` (`USER` | `ADMIN`) for the admin panel.
- **Account / Session / VerificationToken** — NextAuth adapter tables.
- **Result** — one completed test. Stores headline metrics plus `rawData`
  (per-second WPM samples) and `charStats` (correct/incorrect/extra/missed) as
  JSON for graphs and the mistyped-words report. `flagged` marks anti-cheat hits.
- **PersonalBest** — denormalised best WPM per `(user, mode, mode2, language)` for
  O(1) "is this a PB?" checks and fast profile rendering.
- **Achievement** — unlocked milestones (`userId`, `key`, `unlockedAt`).
- **DailyStat** — pre-aggregated per-user daily counters powering streaks and the
  weekly/monthly/lifetime views without scanning every result.
- **WordList / Quote** — content for the word and quote modes (admin-manageable).
- **RaceRoom / RaceParticipant** — multiplayer schema (engine scaffolded, §7).

The full, authoritative schema lives in [`prisma/schema.prisma`](../prisma/schema.prisma).

---

## 4. Folder Structure

```
agoytype/
├── prisma/
│   ├── schema.prisma          # ERD source of truth
│   └── seed.ts                # word lists, quotes, demo users, results
├── docs/
│   ├── ARCHITECTURE.md        # this file
│   └── DEPLOYMENT.md          # Vercel + Railway guide
├── .github/workflows/ci.yml   # lint + typecheck + build + prisma validate
├── Dockerfile                 # multi-stage standalone build
├── docker-compose.yml         # app + postgres
└── src/
    ├── app/
    │   ├── layout.tsx          # root layout, fonts, providers
    │   ├── globals.css         # tokens + theme variables
    │   ├── page.tsx            # the typing test (home)
    │   ├── providers.tsx       # theme + session + toaster
    │   ├── (auth)/login|register
    │   ├── leaderboard/
    │   ├── profile/[username]/
    │   ├── account/            # history & stats dashboard
    │   ├── settings/
    │   └── api/
    │       ├── auth/[...nextauth]/route.ts
    │       ├── auth/register/route.ts
    │       ├── results/route.ts
    │       ├── leaderboard/route.ts
    │       └── user/stats/route.ts
    ├── components/
    │   ├── ui/                 # shadcn primitives
    │   ├── typing/             # engine, caret, words, stats, graph, result
    │   ├── layout/             # navbar, command menu, theme switcher
    │   └── charts/             # Recharts wrappers
    ├── lib/                    # prisma, auth, stats, words, themes, validation, rate-limit
    ├── store/                  # Zustand stores (config + engine)
    ├── hooks/                  # reusable client hooks
    └── types/                  # shared TypeScript types
```

---

## 5. Key Algorithms

- **WPM** = `(correctChars / 5) / (timeSeconds / 60)` — the standard "word = 5
  chars" definition used by Monkeytype/10FF.
- **Raw WPM** = same but counts *all* typed chars (including errors).
- **Accuracy** = `correctChars / totalTypedChars * 100`.
- **Consistency** = `100 * (1 - stdev(perSecondRawWpm) / mean(perSecondRawWpm))`,
  normalised — higher means a steadier pace.
- **Anti-cheat** (`src/lib/anti-cheat.ts`) rejects results whose WPM exceeds a
  human ceiling, whose accuracy/consistency are implausibly perfect at high speed,
  or whose duration/keystroke ratios are impossible.

---

## 6. Security Model

- Security headers via `next.config.mjs` + `middleware.ts`.
- NextAuth provides CSRF tokens for auth routes; mutating API routes require a
  valid session and validate bodies with **zod**.
- In-memory token-bucket rate limiting on write endpoints (swap for Redis/Upstash
  in production — see `src/lib/rate-limit.ts`).
- Passwords hashed with bcrypt (cost 12). Server recomputes WPM from `rawData`
  and flags mismatches.

---

## 7. Roadmap (scaffolded, not yet fully implemented)

These have **schema + types + UI entry points** in place but need a stateful
realtime/back-office layer that is out of scope for the initial build:

1. **Realtime multiplayer** — the `RaceRoom`/`RaceParticipant` tables and a
   `/multiplayer` route exist. Finishing it needs a WebSocket server (e.g. a
   separate `ws`/Socket.IO service or Pusher/Ably) broadcasting keystroke
   progress. The client store is structured to consume those events.
2. **Admin panel** — `role = ADMIN` gating and an `/admin` route group are wired;
   CRUD screens for users/words/leaderboard moderation are the remaining work.
3. **Keyboard heatmap** — `charStats` already records per-key error counts; the
   heatmap is a visualisation layer on top.

Everything else in this document is implemented and runnable.
