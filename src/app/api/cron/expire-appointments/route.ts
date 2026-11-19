import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendCancellationNotice } from "@/lib/email/appointment-emails";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  const appointments = await db.appointment.findMany({
    where: { status: AppointmentStatus.PENDING_PAYMENT, createdAt: { lt: cutoff } },
    include: { user: true, doctor: true, service: true },
  });
  let cancelled = 0;
  for (const appointment of appointments) {
    const result = await db.appointment.updateMany({
      where: { id: appointment.id, status: AppointmentStatus.PENDING_PAYMENT },
      data: { status: AppointmentStatus.CANCELLED, paymentStatus: PaymentStatus.FAILED },
    });
    if (result.count) {
      cancelled += 1;
      await sendCancellationNotice(appointment);
    }
  }
  return NextResponse.json({ cancelled });
}
