"use server";

import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { sendCancellationNotice } from "@/lib/email/appointment-emails";
import { requireAdmin } from "./admin-auth";
import { appointmentFilterSchema } from "./admin-filters";

const appointmentIdSchema = z.string().min(1).max(200);
const statusSchema = z.enum(["COMPLETED", "NO_SHOW"]);

export async function updateAppointmentStatus(input: unknown) {
  await requireAdmin();
  const parsed = z.object({ id: appointmentIdSchema, status: statusSchema }).safeParse(input);
  if (!parsed.success) throw new Error("Invalid appointment status.");
  const result = await db.appointment.updateMany({
    where: { id: parsed.data.id, status: AppointmentStatus.CONFIRMED },
    data: { status: parsed.data.status === "COMPLETED" ? AppointmentStatus.COMPLETED : AppointmentStatus.NO_SHOW },
  });
  if (!result.count) throw new Error("Only confirmed appointments can be marked complete or no-show.");
  return { success: true };
}

export async function cancelAdminAppointment(input: unknown) {
  await requireAdmin();
  const id = appointmentIdSchema.parse(input);
  const appointment = await db.appointment.findUnique({
    where: { id },
    include: { user: true, doctor: true, service: true },
  });
  if (!appointment) throw new Error("Appointment not found.");
  if (appointment.status === AppointmentStatus.CANCELLED) return { success: true };
  try {
    if (appointment.paymentStatus === PaymentStatus.PAID) {
      if (!appointment.stripePaymentIntentId) throw new Error("Paid appointment has no payment intent.");
      await getStripe().refunds.create(
        { payment_intent: appointment.stripePaymentIntentId },
        { idempotencyKey: `admin-cancellation-${appointment.id}` },
      );
    }
    const result = await db.appointment.updateMany({
      where: { id, status: { not: AppointmentStatus.CANCELLED } },
      data: {
        status: AppointmentStatus.CANCELLED,
        paymentStatus: appointment.paymentStatus === PaymentStatus.PAID ? PaymentStatus.REFUNDED : PaymentStatus.FAILED,
      },
    });
    if (result.count) await sendCancellationNotice(appointment);
    return { success: true };
  } catch (error) {
    console.error("Failed to cancel appointment from admin dashboard", { appointmentId: id, error });
    throw new Error("Unable to cancel appointment or issue its refund.");
  }
}

export async function getAdminAppointments(input: unknown) {
  await requireAdmin();
  const filters = appointmentFilterSchema.parse(input);
  const from = filters.from ? new Date(`${filters.from}T00:00:00.000Z`) : undefined;
  const to = filters.to ? new Date(`${filters.to}T23:59:59.999Z`) : undefined;
  return db.appointment.findMany({
    where: {
      ...(filters.doctorId ? { doctorId: filters.doctorId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(from || to ? { startsAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    },
    include: { user: true, doctor: true, service: true },
    orderBy: { startsAt: "desc" },
  });
}

export async function getAdminPatients(search?: string) {
  await requireAdmin();
  const query = z.string().trim().max(100).parse(search ?? "");
  return db.user.findMany({
    where: {
      role: "PATIENT",
      ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }, { phone: { contains: query, mode: "insensitive" } }] } : {}),
    },
    include: {
      appointments: {
        include: { doctor: true, service: true },
        orderBy: { startsAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
