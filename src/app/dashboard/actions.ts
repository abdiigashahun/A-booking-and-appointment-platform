"use server";

import { AppointmentStatus, PaymentStatus, Prisma } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getAvailableSlots } from "@/lib/slots";
import { getStripe } from "@/lib/stripe";
import { sendCancellationNotice } from "@/lib/email/appointment-emails";

const idSchema = z.string().min(1).max(200);
const rescheduleSchema = z.object({
  appointmentId: idSchema,
  startsAt: z.string().datetime({ offset: true }),
});
const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30).optional(),
});
const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(200),
});

type ActionResult = { success: true; message?: string } | { success: false; message: string };

async function getPatient() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function cancelAppointment(input: unknown): Promise<ActionResult> {
  const patient = await getPatient();
  if (!patient) return { success: false, message: "Please log in to manage appointments." };
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Invalid appointment." };

  const appointment = await db.appointment.findFirst({
    where: { id: parsed.data, userId: patient.id },
    include: { user: true, doctor: true, service: true },
  });
  if (!appointment) return { success: false, message: "Appointment not found." };
  if (appointment.status !== AppointmentStatus.CONFIRMED) {
    return { success: false, message: "Only confirmed appointments can be cancelled." };
  }
  if (appointment.startsAt.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
    return { success: false, message: "Appointments can only be cancelled at least 24 hours before the start time." };
  }

  try {
    if (appointment.paymentStatus === PaymentStatus.PAID) {
      if (!appointment.stripePaymentIntentId) {
        return { success: false, message: "This paid appointment cannot be refunded automatically. Please contact the clinic." };
      }
      await getStripe().refunds.create(
        { payment_intent: appointment.stripePaymentIntentId },
        { idempotencyKey: `appointment-cancellation-${appointment.id}` },
      );
    }

    const updated = await db.appointment.updateMany({
      where: { id: appointment.id, userId: patient.id, status: AppointmentStatus.CONFIRMED },
      data: {
        status: AppointmentStatus.CANCELLED,
        paymentStatus: appointment.paymentStatus === PaymentStatus.PAID ? PaymentStatus.REFUNDED : PaymentStatus.FAILED,
      },
    });
    if (!updated.count) return { success: false, message: "The appointment changed. Please refresh and try again." };
    await sendCancellationNotice(appointment);
    return {
      success: true,
      message: appointment.paymentStatus === PaymentStatus.PAID
        ? "Appointment cancelled and refund requested."
        : "Appointment cancelled.",
    };
  } catch (error) {
    console.error("Failed to cancel appointment", { appointmentId: appointment.id, error });
    return { success: false, message: "Unable to cancel the appointment right now. Please try again." };
  }
}

export async function rescheduleAppointment(input: unknown): Promise<ActionResult> {
  const patient = await getPatient();
  if (!patient) return { success: false, message: "Please log in to manage appointments." };
  const parsed = rescheduleSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Choose a valid appointment time." };

  const appointment = await db.appointment.findFirst({
    where: { id: parsed.data.appointmentId, userId: patient.id, status: AppointmentStatus.CONFIRMED },
    include: { service: true },
  });
  if (!appointment) return { success: false, message: "Only confirmed appointments can be rescheduled." };
  if (appointment.startsAt.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
    return { success: false, message: "Appointments can only be rescheduled at least 24 hours before the start time." };
  }

  const startsAt = new Date(parsed.data.startsAt);
  const slots = await getAvailableSlots({
    doctorId: appointment.doctorId,
    serviceId: appointment.serviceId,
    date: parsed.data.startsAt.slice(0, 10),
  });
  if (!slots.includes(startsAt.toISOString())) {
    return { success: false, message: "That time is no longer available. Please choose another slot." };
  }
  const endsAt = new Date(startsAt.getTime() + appointment.service.durationMin * 60_000);

  try {
    await db.$transaction(async (tx) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          id: { not: appointment.id },
          doctorId: appointment.doctorId,
          status: { in: [AppointmentStatus.PENDING_PAYMENT, AppointmentStatus.CONFIRMED] },
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
        },
        select: { id: true },
      });
      if (conflict) throw new Error("SLOT_TAKEN");
      const updated = await tx.appointment.updateMany({
        where: { id: appointment.id, userId: patient.id, status: AppointmentStatus.CONFIRMED },
        data: { startsAt, endsAt, reminderSentAt: null },
      });
      if (!updated.count) throw new Error("APPOINTMENT_CHANGED");
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return { success: true, message: "Appointment rescheduled." };
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return { success: false, message: "That time is no longer available. Please choose another slot." };
    }
    if (error instanceof Error && error.message === "APPOINTMENT_CHANGED") {
      return { success: false, message: "The appointment changed. Please refresh and try again." };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return { success: false, message: "The appointment changed while saving. Please choose the slot again." };
    }
    console.error("Failed to reschedule appointment", { appointmentId: appointment.id, error });
    return { success: false, message: "Unable to reschedule the appointment right now." };
  }
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const patient = await getPatient();
  if (!patient) return { success: false, message: "Please log in to update your profile." };
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Enter a valid name and phone number." };
  await db.user.update({
    where: { id: patient.id },
    data: { name: parsed.data.name, phone: parsed.data.phone?.trim() || null },
  });
  return { success: true, message: "Profile updated." };
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  const patient = await getPatient();
  if (!patient) return { success: false, message: "Please log in to change your password." };
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "The new password must be at least 8 characters." };
  const user = await db.user.findUnique({ where: { id: patient.id }, select: { passwordHash: true } });
  if (!user || !(await compare(parsed.data.currentPassword, user.passwordHash))) {
    return { success: false, message: "The current password is incorrect." };
  }
  await db.user.update({
    where: { id: patient.id },
    data: { passwordHash: await hash(parsed.data.newPassword, 12) },
  });
  return { success: true, message: "Password changed." };
}
