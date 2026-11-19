import Link from "next/link";
import { format, subDays } from "date-fns";
import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { ArrowRight, BriefcaseMedical, CalendarDays, CircleDollarSign, Stethoscope, Tags, Users } from "lucide-react";
import { requireAdmin } from "@/server/admin-auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { BookingChart } from "./chart";

export const dynamic = "force-dynamic";

const clinicTimezone = process.env.CLINIC_TIMEZONE ?? "Africa/Addis_Ababa";

function dayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { gte: start, lt: end };
}

export default async function AdminPage() {
  await requireAdmin();
  const now = new Date();
  const today = dayRange(now);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const thirtyDaysAgo = subDays(now, 29);
  const [todayAppointments, weeklyRevenue, newPatients, noShows, completedPast, chartAppointments] = await Promise.all([
    db.appointment.count({ where: { startsAt: today, status: { not: AppointmentStatus.CANCELLED } } }),
    db.appointment.findMany({ where: { startsAt: { gte: weekStart, lt: weekEnd }, paymentStatus: PaymentStatus.PAID }, select: { service: { select: { depositCents: true } } } }),
    db.user.count({ where: { role: "PATIENT", createdAt: { gte: weekStart, lt: weekEnd } } }),
    db.appointment.count({ where: { startsAt: { lt: now }, status: AppointmentStatus.NO_SHOW } }),
    db.appointment.count({ where: { startsAt: { lt: now }, status: { in: [AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW] } } }),
    db.appointment.findMany({ where: { startsAt: { gte: thirtyDaysAgo, lte: now }, status: { not: AppointmentStatus.CANCELLED } }, select: { startsAt: true } }),
  ]);
  const chartData = Array.from({ length: 30 }, (_, index) => {
    const date = subDays(now, 29 - index);
    const key = format(date, "yyyy-MM-dd");
    return { date: format(date, "MMM d"), bookings: chartAppointments.filter((appointment) => format(appointment.startsAt, "yyyy-MM-dd") === key).length };
  });
  const revenue = weeklyRevenue.reduce((total, appointment) => total + appointment.service.depositCents, 0);
  const noShowRate = completedPast ? Math.round((noShows / completedPast) * 100) : 0;
  const cards = [
    ["Today's appointments", todayAppointments.toString(), CalendarDays],
    ["This week's revenue", `$${(revenue / 100).toFixed(2)}`, CircleDollarSign],
    ["New patients this week", newPatients.toString(), Users],
    ["No-show rate", `${noShowRate}%`, Stethoscope],
  ] as const;
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-primary">Admin dashboard</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Clinic overview</h1><p className="mt-2 text-muted-foreground">Reporting timezone: {clinicTimezone}</p></div>
        <div className="flex flex-wrap gap-2"><Link href="/admin/appointments" className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted">Appointments</Link><Link href="/admin/patients" className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted">Patients</Link></div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([title, value, Icon]) => <Card key={title}><CardContent className="p-5"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-sm text-muted-foreground">{title}</p><p className="mt-1 text-2xl font-bold">{value}</p></CardContent></Card>)}</div>
      <Card className="mt-8"><CardContent className="p-5"><h2 className="mb-5 text-lg font-semibold">Bookings in the last 30 days</h2><BookingChart data={chartData} /></CardContent></Card>
      <div className="mt-8 grid gap-5 md:grid-cols-3">{[["Doctors", "Manage profiles, specialties, services, and availability.", "/admin/doctors", Stethoscope], ["Services", "Set durations, prices, and deposits.", "/admin/services", BriefcaseMedical], ["Specialties", "Organize your care team by specialty.", "/admin/specialties", Tags]].map(([title, text, href, Icon]) => <Link key={href as string} href={href as string}><Card className="h-full transition-shadow hover:shadow-md"><CardContent className="p-6"><div className="flex items-center justify-between"><Icon className="h-6 w-6 text-primary" /><ArrowRight className="h-4 w-4 text-muted-foreground" /></div><h2 className="mt-6 text-lg font-semibold">{title as string}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text as string}</p></CardContent></Card></Link>)}</div>
    </main>
  );
}
