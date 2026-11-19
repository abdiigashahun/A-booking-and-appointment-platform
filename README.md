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

Generate the Auth.js secret locally and add it to `.env.local`:

```bash
openssl rand -base64 32
```

```env
AUTH_SECRET="paste-the-generated-value-here"
```

### Local Stripe webhook testing

Start the app, then forward Stripe events to the local webhook:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed `whsec_...` signing secret into `STRIPE_WEBHOOK_SECRET` in
`.env.local`. Set `CRON_SECRET` to a separate random value for the appointment
cleanup and reminder routes. Configure `RESEND_API_KEY` and a verified
`EMAIL_FROM` address to deliver transactional email. Without a Resend key,
emails are logged to the server console.

## Conventions

- Appointment times are stored in **UTC** and displayed in `CLINIC_TIMEZONE`
  (default `Africa/Addis_Ababa`).
- Double bookings are prevented by a **database unique constraint**, not just
  application checks.
- All server input is validated with zod; authorization is checked in every
  server action and route handler.
- Business logic lives in `src/lib` and `src/server`, not in components.
