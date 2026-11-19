import { requireAdmin } from "@/server/admin-auth";
import { db } from "@/lib/db";
import { DoctorForm, DoctorScheduleForm, TimeOffForm } from "@/components/admin-catalog-forms";

export const dynamic = "force-dynamic";
export default async function AdminDoctorsPage() {
  await requireAdmin();
  const [doctors, specialties, services] = await Promise.all([
    db.doctor.findMany({ include: { services: true, availability: true, timeOff: true }, orderBy: { name: "asc" } }),
    db.specialty.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.service.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  return <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold">Doctors</h1><p className="mt-2 text-muted-foreground">Manage profiles, services, weekly hours, and time off.</p><div className="mt-8 space-y-8"><DoctorForm specialties={specialties} />{doctors.map((doctor) => <section key={doctor.id} className="space-y-4 rounded-2xl border p-5"><div><h2 className="text-xl font-semibold">{doctor.name}</h2><p className="text-sm text-muted-foreground">{doctor.isActive ? "Active" : "Inactive"}</p></div><DoctorForm doctor={doctor} specialties={specialties} /><DoctorScheduleForm doctorId={doctor.id} services={services} assigned={doctor.services.map((item) => item.serviceId)} availability={doctor.availability} /><TimeOffForm doctorId={doctor.id} timeOff={doctor.timeOff} /></section>)}</div></main>;
}
