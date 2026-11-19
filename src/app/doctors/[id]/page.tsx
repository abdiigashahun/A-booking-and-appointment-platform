import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctor = await db.doctor.findUnique({ where: { id }, include: { specialty: true, services: { where: { service: { isActive: true } }, include: { service: true } } } });
  if (!doctor || !doctor.isActive) notFound();
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  return <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8"><Link href="/doctors" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" />All doctors</Link><section className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]"><div className="flex h-56 items-center justify-center rounded-3xl bg-primary/10"><span className="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground">{doctor.name.split(" ").filter(Boolean).slice(-2).map((part) => part[0]).join("")}</span></div><div><Badge variant="success">{doctor.specialty.name}</Badge><h1 className="mt-4 text-4xl font-bold tracking-tight">{doctor.name}</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{doctor.bio ?? "Thoughtful, personalized care focused on your goals and wellbeing."}</p><Button className="mt-7" asChild><Link href={`/book?doctor=${doctor.id}`}>Book now <CalendarCheck className="ml-2 h-4 w-4" /></Link></Button></div></section><section className="mt-16"><h2 className="text-2xl font-bold">Services offered</h2><div className="mt-6 grid gap-4 md:grid-cols-2">{doctor.services.map(({ service }) => <Card key={service.id}><CardContent className="flex items-start justify-between gap-4 p-5"><div><h3 className="font-semibold">{service.name}</h3><p className="mt-1 text-sm text-muted-foreground">{service.description}</p><p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5 text-primary" /> {service.durationMin} minutes</p></div><div className="text-right"><p className="font-semibold">{money.format(service.priceCents / 100)}</p><p className="mt-1 text-xs text-muted-foreground">Deposit {money.format(service.depositCents / 100)}</p></div></CardContent></Card>)}</div>{doctor.services.length === 0 && <p className="mt-4 text-muted-foreground">Services will be available soon.</p>}</section></main>;
}
