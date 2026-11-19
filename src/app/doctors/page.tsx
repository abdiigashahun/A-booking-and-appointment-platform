import Link from "next/link";
import { ArrowRight, Clock3, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CatalogFilters } from "@/components/catalog-filters";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DoctorsPage({ searchParams }: { searchParams: Promise<{ q?: string; specialty?: string }> }) {
  const params = await searchParams;
  const specialties = await db.specialty.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const doctors = await db.doctor.findMany({
    where: { isActive: true, ...(params.q ? { name: { contains: params.q, mode: "insensitive" } } : {}), ...(params.specialty ? { specialtyId: params.specialty } : {}) },
    include: { specialty: true, services: { include: { service: true } } },
    orderBy: { name: "asc" },
  });
  return <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="max-w-2xl"><Badge variant="success">Your care team</Badge><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Find a doctor who listens.</h1><p className="mt-4 text-lg text-muted-foreground">Browse our trusted care team and find the right specialist for your needs.</p></div><div className="mt-10"><CatalogFilters specialties={specialties} /></div><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{doctors.map((doctor) => <Card key={doctor.id} className="overflow-hidden"><CardContent className="p-0"><div className="flex h-40 items-center justify-center bg-primary/10"><div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">{doctor.name.split(" ").filter(Boolean).slice(-2).map((part) => part[0]).join("")}</div></div><div className="p-5"><p className="text-sm font-medium text-primary">{doctor.specialty.name}</p><h2 className="mt-1 text-xl font-semibold">{doctor.name}</h2><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{doctor.bio ?? "Thoughtful, personalized care for every patient."}</p><div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5 text-primary" /> {doctor.services.length} services available</div><Link href={`/doctors/${doctor.id}`} className="mt-5 inline-flex items-center text-sm font-semibold text-primary">View profile <ArrowRight className="ml-1.5 h-4 w-4" /></Link></div></CardContent></Card>)}</div>{doctors.length === 0 && <div className="mt-8 rounded-2xl border border-dashed p-12 text-center"><Stethoscope className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-medium">No doctors match those filters.</p><p className="mt-1 text-sm text-muted-foreground">Try a different search or specialty.</p></div>}</main>;
}
