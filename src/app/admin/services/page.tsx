import { requireAdmin } from "@/server/admin-auth";
import { db } from "@/lib/db";
import { ServiceForm } from "@/components/admin-catalog-forms";

export const dynamic = "force-dynamic";
export default async function AdminServicesPage() {
  await requireAdmin();
  const services = await db.service.findMany({ orderBy: { name: "asc" } });
  return <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold">Services</h1><p className="mt-2 text-muted-foreground">Set appointment duration, price, and deposit amounts in cents.</p><div className="mt-8 space-y-5"><ServiceForm />{services.map((service) => <ServiceForm key={service.id} service={service} />)}</div></main>;
}
