import Link from "next/link";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await db.service.findMany({ where: { isActive: true }, include: { doctors: { include: { doctor: true } } }, orderBy: { name: "asc" } });
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  return <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="max-w-2xl"><Badge variant="success"><Sparkles className="mr-1.5 h-3.5 w-3.5" /> Care made simple</Badge><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Care that meets you where you are.</h1><p className="mt-4 text-lg text-muted-foreground">Explore our services and find the right next step for your health.</p></div><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{services.map((service) => <Card key={service.id}><CardContent className="p-6"><h2 className="text-xl font-semibold">{service.name}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{service.description}</p><div className="mt-5 flex items-center justify-between border-t pt-4"><div><p className="font-semibold">{money.format(service.priceCents / 100)}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> {service.durationMin} min</p></div><Link href="/doctors" className="inline-flex items-center text-sm font-semibold text-primary">Find a doctor <ArrowRight className="ml-1 h-4 w-4" /></Link></div></CardContent></Card>)}</div></main>;
}
