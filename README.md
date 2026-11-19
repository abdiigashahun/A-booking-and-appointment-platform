# CareSlot

A clinic appointment booking platform. Patients browse open slots, reserve one,
and confirm with a Stripe deposit; clinics manage their schedule from an admin
area.

## Tech stack

| Concern       | Choice                                              |
| ------------- | --------------------------------------------------- |
| Framework     | Next.js 15 (App Router) + TypeScript (strict)       |
| Styling       | Tailwind CSS v4 + shadcn/ui, lucide-react           |
| Database      | Supabase PostgreSQL via Prisma ORM                  |
| Auth          | Auth.js (next-auth v5), email + password, JWT       |
| Payments      | Stripe Checkout (test mode) + webhooks for deposits |
| Email         | Resend + react-email                                |
| Validation    | zod + react-hook-form                               |
| Dates         | date-fns + date-fns-tz                              |
| Testing       | Vitest (unit), Playwright (e2e)                     |
| CI / Deploy   | GitHub Actions, Vercel                              |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | What it does                        |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Start the dev server (Turbopack)    |
| `npm run build`     | Production build                    |
| `npm run start`     | Serve the production build          |
| `npm run lint`      | ESLint                              |
| `npm run typecheck` | TypeScript, no emit (`tsc --noEmit`) |
| `npm run test`      | Vitest (unit)                       |
| `npm run e2e`       | Playwright (end-to-end)             |

## Environment variables

All configuration lives in `.env.local` (gitignored). See `.env.example` for the
full list with placeholder values — never commit real secrets.

## Conventions

- Appointment times are stored in **UTC** and displayed in `CLINIC_TIMEZONE`
  (default `Africa/Addis_Ababa`).
- Double bookings are prevented by a **database unique constraint**, not just
  application checks.
- All server input is validated with zod; authorization is checked in every
  server action and route handler.
- Business logic lives in `src/lib` and `src/server`, not in components.
