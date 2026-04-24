# CodeClash

> Turn LeetCode into a game. Track public LeetCode stats, earn XP, climb ranked leaderboards, and face off against friends.

CodeClash mashes up **LeetCode's grind**, **Duolingo's streaks**, and a **ranked game ladder**. Users connect a public LeetCode username and get rewarded for every solve: XP, levels, badges, weekly challenges, and a global leaderboard they can climb with friends and rivals.

## Stack

| Layer    | Tech                                          |
| -------- | --------------------------------------------- |
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, React Router |
| Backend  | Node.js + Express + TypeScript, Zod           |
| Database | PostgreSQL + Prisma ORM                       |
| Auth     | Email/password with JWT (Google OAuth ready — client IDs are wired up via env) |
| Deploy   | Vercel (frontend) · Render / Railway / Fly.io (backend + PG) |

## Repo layout

```
.
├── backend/    # Express API, Prisma schema, LeetCode services
├── frontend/   # React + Vite SPA
└── README.md
```

## Features at a glance

- **Gamified LeetCode tracking** — XP (10 Easy / 25 Medium / 50 Hard), streak bonus (+20), weekly challenge bonus (+100).
- **Levels** — `level = floor(totalXP / 500) + 1` — with XP bars everywhere.
- **Badges** — First Blood, Grinder, Medium Menace, Hardcore, Consistency Demon.
- **Weekly challenges** — auto-generated per week, progress auto-tracked on sync.
- **Three leaderboards** — global, weekly, friends-only.
- **Friends + Rivals** — friend requests, side-by-side rival stat comparison, "You passed your rival" events.
- **Activity feed** — solves, level-ups, badges, challenges, rival-passes.
- **Modular LeetCode fetcher** — `mock` provider (deterministic, offline-safe) or `live` provider (LeetCode GraphQL) — swap via env.
- **Safety** — only public LeetCode profile data is used. The app never asks for a LeetCode password.

## Quick start

### 1. Prerequisites

- Node 18+
- npm (or pnpm / yarn)
- A running PostgreSQL (local or cloud)

### 2. Backend

```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL, JWT_SECRET
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed                  # seeds badges, weekly challenges, demo users
npm run dev
```

API runs at image.png. Visit http://localhost:4000/api/health to sanity-check.

### 3. Frontend

```bash
cd ../frontend
cp .env.example .env          # optional — defaults to /api via Vite proxy
npm install
npm run dev
```

Open http://localhost:5173. The dev server proxies `/api/*` to the backend, so CORS is a non-issue in development.

### Seeded demo account

After running `npm run seed`:

| Field    | Value                  |
| -------- | ---------------------- |
| Username | `demo`                 |
| Password | `password123`          |

The seed also creates demo friends (`alex`, `kevin`, `sarah`, `mira`), rivalry, badges, weekly challenges, and starter activity feed entries — so the leaderboards and demo look alive immediately.

## Environment variables

### Backend (`backend/.env`)

| Var | Required | Default | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | ✅ | — | Postgres connection string |
| `JWT_SECRET` | ✅ | — | Long random string, production must not use the default |
| `JWT_EXPIRES_IN` | | `7d` | Accepts `ms`-style durations |
| `PORT` | | `4000` | |
| `CORS_ORIGIN` | | `http://localhost:5173` | Comma-separated list |
| `LEETCODE_MODE` | | `mock` | `mock` (deterministic fake stats) or `live` (real LeetCode GraphQL) |
| `LEETCODE_CACHE_MINUTES` | | `30` | Time to cache profile data before re-fetching |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | | — | Placeholders for Google OAuth |
| `FIREBASE_PROJECT_ID` | | — | Enables `/api/auth/firebase` Google sign-in |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | | — | Service account JSON as a single env string |
| `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` | | — | Path to service account JSON file |

### Frontend (`frontend/.env`)

| Var | Required | Default | Notes |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | | empty → uses Vite proxy | Set in production to your deployed API URL |
| `VITE_FIREBASE_*` | | — | Web config from Firebase Console. If present, enables Google sign-in + Analytics. |

## Firebase / Google sign-in

CodeClash can use Firebase Auth purely for **Google sign-in**. All user data still lives in Postgres — Firebase only verifies identity.

### One-time Firebase setup

1. Firebase Console → **Authentication** → Sign-in method → enable **Google**.
2. Add `http://localhost:5173` and your production domain under **Authorized domains**.
3. Project Settings → General → your web app → copy the config → paste values into `frontend/.env.local`.
4. Project Settings → **Service accounts** → Generate new private key. Either:
   - Save the file and set `FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/abs/path/service-account.json` in `backend/.env`, **or**
   - Paste the full JSON into `FIREBASE_SERVICE_ACCOUNT_JSON` (one-line string).
5. Also set `FIREBASE_PROJECT_ID=<your-project-id>`.

### How it works

- User clicks **Continue with Google** → Firebase handles the popup.
- Frontend gets an ID token → POSTs it to `POST /api/auth/firebase`.
- Backend calls `firebase-admin.verifyIdToken` → creates or finds the user in Postgres → returns a CodeClash JWT.
- From here on, requests use the CodeClash JWT like email/password users.

## API surface

All JSON. Auth endpoints return `{ token, user }`. Protected endpoints expect `Authorization: Bearer <token>`.

**Auth**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/me`

**Users**
- `GET    /api/users/:idOrUsername`
- `PATCH  /api/users/me` — `displayName`, `bio`, `avatarUrl`, `rivalId`
- `GET    /api/users/search?query=`

**LeetCode**
- `POST /api/leetcode/connect` — `{ leetcodeUsername }` (validates and caches)
- `POST /api/leetcode/sync` — `{ force?: boolean }` — refreshes, awards XP/badges/streak
- `GET  /api/leetcode/:username`

**Leaderboard**
- `GET /api/leaderboard/global`
- `GET /api/leaderboard/weekly`
- `GET /api/leaderboard/friends` *(auth required)*

**Friends**
- `GET    /api/friends` — grouped as `{ friends, incoming, outgoing }`
- `POST   /api/friends/request` — `{ userId? | username? }`
- `POST   /api/friends/accept` — `{ friendshipId }`
- `DELETE /api/friends/:idOrUserId`

**Challenges**
- `GET  /api/challenges/weekly`
- `POST /api/challenges/check-progress` *(forces a LeetCode sync)*

**Activity**
- `GET /api/activity/feed?before=<iso>&limit=25`

## Data model (Prisma)

`User`, `LeetCodeProfile`, `Friendship`, `Badge`, `UserBadge`, `WeeklyChallenge`, `UserChallengeProgress`, `ActivityEvent`. Full schema in `backend/prisma/schema.prisma`.

## Scoring — the canonical numbers

| Event | Reward |
| --- | --- |
| Easy solve | +10 XP |
| Medium solve | +25 XP |
| Hard solve | +50 XP |
| Daily streak maintained | +20 XP |
| Weekly challenge completed | +100 XP |
| Level formula | `floor(totalXp / 500) + 1` |

All numbers live in a single source of truth: `backend/src/utils/game.ts`.

## Swapping the LeetCode provider

`backend/src/services/leetcode/` exports a small `LeetcodeProvider` interface. `MockLeetcodeProvider` gives deterministic profile data so local dev and tests are stable without hitting external services. `LiveLeetcodeProvider` hits the LeetCode public GraphQL endpoint. Swap via `LEETCODE_MODE=live|mock`.

To wire in any other source (leetcode-stats-api, your own scraper, a premium API), just add a new class implementing `LeetcodeProvider` and register it in `services/leetcode/index.ts`.

## Deployment

### Frontend → Vercel
1. Set root directory to `frontend/`.
2. `VITE_API_BASE_URL=https://<your-api-host>`
3. Build command `npm run build`, output `dist/`.

### Backend → Render / Railway
1. New Web Service from `backend/`.
2. Attach a managed PostgreSQL addon → set `DATABASE_URL`.
3. Set `JWT_SECRET`, `CORS_ORIGIN=https://<your-vercel-domain>`, optionally `LEETCODE_MODE=live`.
4. Build: `npm install && npx prisma migrate deploy && npm run build`.
5. Start: `node dist/index.js`.

## Important rules built in

- **No LeetCode passwords.** The app reads public GraphQL data only.
- **Caches** LeetCode responses for `LEETCODE_CACHE_MINUTES` to avoid hammering upstream.
- **Username not found** → the service throws a 404, surfaced to the UI.
- Frontend has **loading states** on every data-backed screen and **empty states** for every collection (no friends, no activity, no badges, no challenges).

## Scripts cheat-sheet

Backend:
```
npm run dev               # tsx watch
npm run build             # tsc
npm run start             # node dist/index.js
npm run seed              # runs prisma/seed.ts
npx prisma migrate dev    # create/apply a migration
npx prisma studio         # visual DB browser
```

Frontend:
```
npm run dev               # vite
npm run build             # tsc --noEmit && vite build
npm run preview           # serve production build
```

## License

MIT — ship it. Have fun. Crush your rival.
