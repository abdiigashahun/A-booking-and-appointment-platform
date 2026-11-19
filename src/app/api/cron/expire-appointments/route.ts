import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  const result = await db.appointment.updateMany({
    where: { status: AppointmentStatus.PENDING_PAYMENT, createdAt: { lt: cutoff } },
    data: { status: AppointmentStatus.CANCELLED, paymentStatus: PaymentStatus.FAILED },
  });
  return NextResponse.json({ cancelled: result.count });
}
