import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");
  const appointments = await db.appointment.findMany({
    where: { userId: session.user.id },
    include: { doctor: true, service: true },
    orderBy: { startsAt: "asc" },
  });
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });
  if (!user) redirect("/login");
  return <DashboardClient appointments={appointments} user={user} />;
}
