import { redirect } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { BookingForm } from "./booking-form";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const session = await auth();
  const [services, doctors] = await Promise.all([
    db.service.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.doctor.findMany({ where: { isActive: true }, include: { specialty: { select: { name: true } }, services: { select: { serviceId: true } } }, orderBy: { name: "asc" } }),
  ]);
  if (!services.length) redirect("/services");
  return <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="mb-10 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarCheck className="h-6 w-6" /></div><div><h1 className="text-3xl font-bold tracking-tight">Book an appointment</h1><p className="text-sm text-muted-foreground">{session ? `Booking for ${session.user.name ?? session.user.email}` : "Choose a time that works for you."}</p></div></div><BookingForm services={services} doctors={doctors} /></main>;
}
