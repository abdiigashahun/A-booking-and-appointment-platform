import Link from "next/link";
import { format } from "date-fns";
import { getAdminPatients } from "@/server/admin-actions";
import { requireAdmin } from "@/server/admin-auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function label(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

export const dynamic = "force-dynamic";

export default async function AdminPatientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const patients = await getAdminPatients(params.q);
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">← Admin overview</Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Patients</h1>
      <Card className="mt-8"><CardContent className="p-5"><form className="flex gap-2"><input name="q" defaultValue={params.q} placeholder="Search name, email, or phone" className="flex h-11 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm" /><button className="rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground" type="submit">Search</button></form></CardContent></Card>
      <div className="mt-6 space-y-4">{patients.map((patient) => <Card key={patient.id}><CardContent className="p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h2 className="text-lg font-semibold">{patient.name}</h2><p className="text-sm text-muted-foreground">{patient.email}{patient.phone ? ` · ${patient.phone}` : ""}</p><p className="mt-1 text-xs text-muted-foreground">Joined {format(patient.createdAt, "MMM d, yyyy")}</p></div><p className="text-sm text-muted-foreground">{patient.appointments.length} appointment{patient.appointments.length === 1 ? "" : "s"}</p></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b text-muted-foreground"><th className="px-2 py-2 font-medium">Date</th><th className="px-2 py-2 font-medium">Service</th><th className="px-2 py-2 font-medium">Doctor</th><th className="px-2 py-2 font-medium">Status</th></tr></thead><tbody className="divide-y">{patient.appointments.map((appointment) => <tr key={appointment.id}><td className="px-2 py-2">{format(appointment.startsAt, "MMM d, yyyy h:mm a")}</td><td className="px-2 py-2">{appointment.service.name}</td><td className="px-2 py-2">{appointment.doctor.name}</td><td className="px-2 py-2"><Badge variant={appointment.status === "CONFIRMED" || appointment.status === "COMPLETED" ? "success" : "outline"}>{label(appointment.status)}</Badge></td></tr>)}</tbody></table></div></CardContent></Card>)}{!patients.length && <Card><CardContent className="p-10 text-center text-muted-foreground">No patients found.</CardContent></Card>}</div>
    </main>
  );
}
