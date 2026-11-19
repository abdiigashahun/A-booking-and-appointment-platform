import { NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableSlots } from "@/lib/slots";
import { db } from "@/lib/db";

const querySchema = z.object({
  doctorId: z.string().min(1).max(200),
  serviceId: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must use YYYY-MM-DD format"),
});

export async function GET(request: Request) {
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid slot query." }, { status: 400 });
  }

  try {
    if (parsed.data.doctorId === "any") {
      const doctors = await db.doctor.findMany({
        where: { isActive: true, services: { some: { serviceId: parsed.data.serviceId } } },
        select: { id: true },
      });
      const results = await Promise.all(doctors.map(async (doctor) => ({
        doctorId: doctor.id,
        slots: await getAvailableSlots({ ...parsed.data, doctorId: doctor.id }),
      })));
      const slots = [...new Set(results.flatMap((result) => result.slots))].sort();
      return NextResponse.json({ slots });
    }
    const slots = await getAvailableSlots(parsed.data);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Failed to load available slots", error);
    return NextResponse.json({ error: "Unable to load available slots." }, { status: 500 });
  }
}
