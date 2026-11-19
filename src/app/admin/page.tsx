import Link from "next/link";
import { ArrowRight, BriefcaseMedical, Stethoscope, Tags } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/server/admin-auth";

export default async function AdminPage() {
  await requireAdmin();
  return <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold tracking-tight">Admin workspace</h1><p className="mt-2 text-muted-foreground">Manage your clinic catalog, care team, and availability.</p><div className="mt-8 grid gap-5 md:grid-cols-3">{[["Doctors", "Manage profiles, specialties, services, and availability.", "/admin/doctors", Stethoscope], ["Services", "Set durations, prices, and deposits.", "/admin/services", BriefcaseMedical], ["Specialties", "Organize your care team by specialty.", "/admin/specialties", Tags]].map(([title, text, href, Icon]) => <Link key={href as string} href={href as string}><Card className="h-full transition-shadow hover:shadow-md"><CardContent className="p-6"><div className="flex items-center justify-between"><Icon className="h-6 w-6 text-primary" /><ArrowRight className="h-4 w-4 text-muted-foreground" /></div><h2 className="mt-6 text-lg font-semibold">{title as string}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text as string}</p></CardContent></Card></Link>)}</div></main>;
}
