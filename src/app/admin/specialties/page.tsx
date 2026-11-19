import { requireAdmin } from "@/server/admin-auth";
import { db } from "@/lib/db";
import { SpecialtyForm } from "@/components/admin-catalog-forms";

export const dynamic = "force-dynamic";
export default async function AdminSpecialtiesPage() {
  await requireAdmin();
  const specialties = await db.specialty.findMany({ orderBy: { name: "asc" } });
  return <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold">Specialties</h1><p className="mt-2 text-muted-foreground">Organize your doctors into care areas.</p><div className="mt-8 space-y-3"><SpecialtyForm />{specialties.map((specialty) => <div key={specialty.id} className="flex items-center justify-between rounded-xl border p-4"><div><p className="font-medium">{specialty.name}</p><p className="text-xs text-muted-foreground">{specialty.isActive ? "Active" : "Inactive"}</p></div><SpecialtyForm specialty={specialty} /></div>)}</div></main>;
}
