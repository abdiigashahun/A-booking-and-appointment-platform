import { NextResponse } from "next/server";
import { getAdminAppointments } from "@/server/admin-actions";
import { appointmentCsv } from "@/server/admin-csv";
import { appointmentFilterSchema } from "@/server/admin-filters";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = appointmentFilterSchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
  try {
    const appointments = await getAdminAppointments(parsed.data);
    return new NextResponse(appointmentCsv(appointments), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="careslot-appointments.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to export appointments", error);
    return NextResponse.json({ error: "Unable to export appointments." }, { status: 500 });
  }
}
