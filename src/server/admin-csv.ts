import type { Prisma } from "@prisma/client";

type AdminAppointment = Prisma.AppointmentGetPayload<{
  include: { user: true; doctor: true; service: true };
}>;

function csvCell(value: string | number | Date | null) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function appointmentCsv(appointments: AdminAppointment[]) {
  const rows = [
    ["Date", "Patient", "Email", "Doctor", "Service", "Status", "Payment", "Amount (USD)"],
    ...appointments.map((appointment) => [
      appointment.startsAt,
      appointment.user.name,
      appointment.user.email,
      appointment.doctor.name,
      appointment.service.name,
      appointment.status,
      appointment.paymentStatus,
      (appointment.service.depositCents / 100).toFixed(2),
    ]),
  ];
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
