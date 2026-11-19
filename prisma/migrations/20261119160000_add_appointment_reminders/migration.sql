ALTER TABLE "Appointment" ADD COLUMN "reminderSentAt" TIMESTAMP(3);

CREATE INDEX "Appointment_status_startsAt_reminderSentAt_idx"
ON "Appointment"("status", "startsAt", "reminderSentAt");
