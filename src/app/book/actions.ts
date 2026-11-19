"use server";

import { AppointmentStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getAvailableSlots } from "@/lib/slots";

const appointmentSchema = z.object({
  serviceId: z.string().min(1).max(200),
  doctorId: z.string().min(1).max(200),
  startsAt: z.string().datetime({ offset: true }),
  notes: z.string().trim().max(1000).optional(),
});

export type AppointmentResult =
  | { success: true; appointmentId: string }
  | { success: false; code: "UNAUTHENTICATED" | "SLOT_TAKEN" | "INVALID"; message: string };

export async function createAppointment(input: unknown): Promise<AppointmentResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, code: "UNAUTHENTICATED", message: "Please log in to book an appointment." };
  }

  const parsed = appointmentSchema.safeParse(input);
  if (!parsed.success) return { success: false, code: "INVALID", message: "Please choose a valid service, doctor, and time." };

  const service = await db.service.findFirst({ where: { id: parsed.data.serviceId, isActive: true } });
  if (!service) return { success: false, code: "INVALID", message: "That service is no longer available." };

  const candidates = parsed.data.doctorId === "any"
    ? await db.doctor.findMany({ where: { isActive: true, services: { some: { serviceId: service.id } } }, select: { id: true } })
    : [{ id: parsed.data.doctorId }];
  const start = new Date(parsed.data.startsAt);
  let doctorId: string | undefined;
  for (const candidate of candidates) {
    const slots = await getAvailableSlots({ doctorId: candidate.id, serviceId: service.id, date: parsed.data.startsAt.slice(0, 10) });
    if (slots.includes(start.toISOString())) {
      doctorId = candidate.id;
      break;
    }
  }
  if (!doctorId) return { success: false, code: "SLOT_TAKEN", message: "That slot is no longer available. Please choose another time." };

  const endsAt = new Date(start.getTime() + service.durationMin * 60_000);
  try {
    const appointment = await db.appointment.create({
      data: {
        userId: session.user.id,
        doctorId,
        serviceId: service.id,
        startsAt: start,
        endsAt,
        status: AppointmentStatus.PENDING_PAYMENT,
        notes: parsed.data.notes?.trim() || null,
      },
    });
    return { success: true, appointmentId: appointment.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, code: "SLOT_TAKEN", message: "That slot was just taken. Please choose another time." };
    }
    throw error;
  }
}
