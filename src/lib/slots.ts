import { AppointmentStatus } from "@prisma/client";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { getDay } from "date-fns";
import { db } from "@/lib/db";

const CLINIC_TIMEZONE = process.env.CLINIC_TIMEZONE ?? "Africa/Addis_Ababa";
const SLOT_STEP_MINUTES = 15;
const MINIMUM_NOTICE_MS = 2 * 60 * 60 * 1000;
const PENDING_HOLD_MS = 15 * 60 * 1000;

type SlotOptions = {
  doctorId: string;
  serviceId: string;
  date: string;
  now?: Date;
};

function localDateTime(date: string, minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const remaining = (minutes % 60).toString().padStart(2, "0");
  return fromZonedTime(`${date}T${hours}:${remaining}:00`, CLINIC_TIMEZONE);
}

function overlaps(start: Date, end: Date, blockedStart: Date, blockedEnd: Date) {
  return start < blockedEnd && end > blockedStart;
}

export async function getAvailableSlots({ doctorId, serviceId, date, now = new Date() }: SlotOptions) {
  const dayStart = localDateTime(date, 0);
  const dayEnd = localDateTime(date, 24 * 60);
  const clinicDate = toZonedTime(dayStart, CLINIC_TIMEZONE);
  const weekday = getDay(clinicDate);

  const [doctor, service, appointments, timeOff] = await Promise.all([
    db.doctor.findUnique({
      where: { id: doctorId },
      include: { availability: { where: { weekday } } },
    }),
    db.service.findUnique({ where: { id: serviceId } }),
    db.appointment.findMany({
      where: {
        doctorId,
        status: { in: [AppointmentStatus.PENDING_PAYMENT, AppointmentStatus.CONFIRMED] },
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
      },
      select: { startsAt: true, endsAt: true, status: true, createdAt: true },
    }),
    db.timeOff.findMany({
      where: { doctorId, startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } },
      select: { startsAt: true, endsAt: true },
    }),
  ]);

  if (!doctor?.isActive || !service?.isActive) return [];

  const blockedAppointments = appointments.filter(
    (appointment) =>
      appointment.status !== AppointmentStatus.PENDING_PAYMENT ||
      now.getTime() - appointment.createdAt.getTime() < PENDING_HOLD_MS,
  );
  const earliestStart = new Date(now.getTime() + MINIMUM_NOTICE_MS);
  const slots: string[] = [];

  for (const window of doctor.availability) {
    for (let startMinute = window.startMinute; startMinute + service.durationMin <= window.endMinute; startMinute += SLOT_STEP_MINUTES) {
      const start = localDateTime(date, startMinute);
      const end = localDateTime(date, startMinute + service.durationMin);
      if (start < earliestStart) continue;
      if (blockedAppointments.some((appointment) => overlaps(start, end, appointment.startsAt, appointment.endsAt))) continue;
      if (timeOff.some((period) => overlaps(start, end, period.startsAt, period.endsAt))) continue;
      slots.push(start.toISOString());
    }
  }

  return slots;
}
