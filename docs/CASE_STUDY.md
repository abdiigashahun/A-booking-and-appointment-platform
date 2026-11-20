# CareSlot Case Study

## Problem

Clinic scheduling is often split across phone calls, shared spreadsheets, and
manual payment follow-up. Patients cannot see dependable availability; staff
must reconcile appointments, cancellations, deposits, and reminders; and two
people can accidentally reserve the same doctor slot.

CareSlot needed to demonstrate a complete booking workflow rather than a static
catalog: discover services, choose a doctor and slot, authenticate, pay a
deposit, receive confirmation, and manage the resulting appointment.

## Solution

I built CareSlot as a secure Next.js application with patient and admin
journeys:

- Public catalog pages for specialties, services, doctors, and availability.
- Credential-based patient accounts and role-aware dashboard access.
- Real-time slot calculation using availability, existing appointments, and
  time-off periods.
- Stripe Checkout deposits with signed webhook-driven confirmation.
- Patient appointment viewing, rescheduling, cancellation, and profile actions.
- Admin controls for catalog, patients, appointments, reporting, and CSV export.
- Scheduled expiration and reminder jobs plus transactional email.
- Supabase PostgreSQL persistence and Prisma migrations.

The system uses UTC for stored timestamps and the clinic's IANA timezone for
presentation, with PostgreSQL constraints as the final booking integrity guard.

## My role

I designed and implemented the product across the full stack:

- Designed the database schema and migrations.
- Built the App Router UI and responsive component patterns.
- Implemented authentication, role authorization, validation, and rate limiting.
- Implemented slot generation and transactional appointment creation.
- Integrated Stripe Checkout, signed webhooks, refunds, and payment state.
- Built the admin dashboard and patient account workflows.
- Added Resend/react-email notifications and Vercel cron integrations.
- Added Vitest and Playwright coverage and GitHub Actions CI.
- Prepared environment, deployment, and database seed documentation.

## Challenges and how I solved them

### Preventing concurrent double bookings

Checking availability before inserting an appointment is not sufficient in
concurrent requests. I added a PostgreSQL partial unique index on
`doctorId + startsAt` for `PENDING_PAYMENT` and `CONFIRMED` appointments. The
application remains responsible for friendly slot filtering, while the database
guarantees that only one active appointment can reserve a slot.

### Trusting payment status

Client redirects are unreliable and should never determine whether an
appointment is paid. I separated reservation creation from confirmation:
booking first creates a pending appointment, Stripe Checkout creates a signed
payment session, and the Stripe webhook is the authoritative path for updating
payment and appointment status.

### Keeping repeated webhook delivery safe

Stripe can retry webhook events. I used unique Stripe session and payment
identifiers, matched records by their identifiers, and restricted updates to
valid status transitions. This makes repeated delivery unlikely to duplicate or
inconsistently overwrite appointment state.

### Correct date and slot handling

Availability is stored as weekday and minute boundaries, while appointments are
stored as timestamps. I generated candidate UTC slots, filtered them by
existing bookings and time-off, and expired stale pending reservations. The
clinic timezone is applied explicitly at display and scheduling boundaries.

### Controlling scheduled and privileged actions

Cron routes are protected with a bearer secret and admin operations verify the
authenticated role before changing records. Server actions and route handlers
therefore keep authorization and validation close to database writes.

## Results

The finished platform provides a complete patient and administration workflow:

- Patients can create accounts, discover doctors, select real slots, pay a test
  deposit, and manage appointments.
- Admins can maintain catalog data and appointment operations.
- Payment confirmation no longer depends on a browser redirect.
- Database constraints prevent active appointments from sharing a doctor slot.
- Scheduled cleanup prevents stale unpaid reservations from remaining visible.
- Automated checks validate code, type safety, slot logic, and browser journeys.

## What I would build next

- Add end-user calendar subscriptions and richer rescheduling workflows.
- Build email/SMS delivery status tracking and configurable reminder policies.
- Add row-level audit history for administrative changes.
- Introduce real-time slot locking and a Redis-backed distributed lock or queue.
- Add doctor and service availability management with timezone-aware calendars.
- Add deeper reporting: utilization, no-shows, refunds, revenue, and conversion.
- Add Sentry or OpenTelemetry observability for webhook, cron, and payment
  failures.
- Add comprehensive integration tests against an isolated PostgreSQL database.
