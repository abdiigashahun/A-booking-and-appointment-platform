import { AppointmentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAppointmentReminder } from "@/lib/email/appointment-emails";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();
  const until = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const appointments = await db.appointment.findMany({
    where: {
      status: AppointmentStatus.CONFIRMED,
      startsAt: { gte: now, lt: until },
      reminderSentAt: null,
    },
    include: { user: true, doctor: true, service: true },
  });

  let reminded = 0;
  for (const appointment of appointments) {
    const claimed = await db.appointment.updateMany({
      where: { id: appointment.id, status: AppointmentStatus.CONFIRMED, reminderSentAt: null },
      data: { reminderSentAt: new Date() },
    });
    if (!claimed.count) continue;
    await sendAppointmentReminder(appointment);
    reminded += 1;
  }

  return NextResponse.json({ reminded });
}
