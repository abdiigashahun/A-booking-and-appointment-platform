import Link from "next/link";
import { format } from "date-fns";
import { AppointmentStatus } from "@prisma/client";
import { getAdminAppointments } from "@/server/admin-actions";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/admin-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentActions } from "./actions-client";

export const dynamic = "force-dynamic";

const statuses = Object.values(AppointmentStatus);

function label(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

export default async function AdminAppointmentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const filters = { from: params.from, to: params.to, doctorId: params.doctorId, status: params.status as AppointmentStatus | undefined };
  const [appointments, doctors] = await Promise.all([
    getAdminAppointments(filters),
    db.doctor.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const query = new URLSearchParams(Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])));
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">← Admin overview</Link><h1 className="mt-3 text-3xl font-bold tracking-tight">Appointments</h1></div><Button variant="outline" asChild><a href={`/api/admin/appointments/export?${query.toString()}`}>Export CSV</a></Button></div>
      <Card className="mt-8"><CardContent className="p-5"><form className="grid gap-3 md:grid-cols-5"><label className="space-y-1 text-sm"><span className="font-medium">From</span><input name="from" type="date" defaultValue={params.from} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label><label className="space-y-1 text-sm"><span className="font-medium">To</span><input name="to" type="date" defaultValue={params.to} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label><label className="space-y-1 text-sm"><span className="font-medium">Doctor</span><select name="doctorId" defaultValue={params.doctorId ?? ""} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="">All doctors</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}</select></label><label className="space-y-1 text-sm"><span className="font-medium">Status</span><select name="status" defaultValue={params.status ?? ""} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></label><div className="flex items-end gap-2"><Button type="submit">Filter</Button><Button type="button" variant="ghost" asChild><Link href="/admin/appointments">Clear</Link></Button></div></form></CardContent></Card>
      <div className="mt-6 overflow-x-auto rounded-2xl border"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-muted/50"><tr><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 font-semibold">Patient</th><th className="px-4 py-3 font-semibold">Doctor</th><th className="px-4 py-3 font-semibold">Service</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Payment</th><th className="px-4 py-3 font-semibold">Actions</th></tr></thead><tbody className="divide-y">{appointments.map((appointment) => <tr key={appointment.id}><td className="px-4 py-4">{format(appointment.startsAt, "MMM d, yyyy h:mm a")}</td><td className="px-4 py-4"><div className="font-medium">{appointment.user.name}</div><div className="text-xs text-muted-foreground">{appointment.user.email}</div></td><td className="px-4 py-4">{appointment.doctor.name}</td><td className="px-4 py-4">{appointment.service.name}</td><td className="px-4 py-4"><Badge variant={appointment.status === "CONFIRMED" ? "success" : appointment.status === "CANCELLED" ? "outline" : "secondary"}>{label(appointment.status)}</Badge></td><td className="px-4 py-4">{label(appointment.paymentStatus)}</td><td className="px-4 py-4"><AppointmentActions id={appointment.id} status={appointment.status} /></td></tr>)}</tbody></table>{!appointments.length && <p className="p-10 text-center text-muted-foreground">No appointments match these filters.</p>}</div>
    </main>
  );
}
