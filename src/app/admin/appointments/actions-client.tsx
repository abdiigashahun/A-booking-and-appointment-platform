"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cancelAdminAppointment, updateAppointmentStatus } from "@/server/admin-actions";
import { Button } from "@/components/ui/button";

export function AppointmentActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run = (action: () => Promise<unknown>) => startTransition(async () => { await action(); router.refresh(); });
  return (
    <div className="flex flex-wrap gap-2">
      {status === "CONFIRMED" && <>
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => run(() => updateAppointmentStatus({ id, status: "COMPLETED" }))}>Completed</Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => updateAppointmentStatus({ id, status: "NO_SHOW" }))}>No-show</Button>
      </>}
      {status !== "CANCELLED" && status !== "COMPLETED" && status !== "NO_SHOW" && (
        <Button size="sm" variant="destructive" disabled={pending} onClick={() => run(() => cancelAdminAppointment(id))}>Cancel</Button>
      )}
    </div>
  );
}
