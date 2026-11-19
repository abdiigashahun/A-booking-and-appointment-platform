"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { CalendarDays, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { cancelAppointment, rescheduleAppointment } from "./actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Appointment = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  paymentStatus: string;
  doctor: { id: string; name: string };
  service: { id: string; name: string; durationMin: number };
};

type Props = {
  appointments: Appointment[];
  user: { name: string; email: string; phone: string | null };
};

function statusVariant(status: string) {
  if (status === "CONFIRMED" || status === "COMPLETED") return "success" as const;
  if (status === "CANCELLED" || status === "NO_SHOW") return "outline" as const;
  return "secondary" as const;
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

function AppointmentCard({ appointment, onChanged }: { appointment: Appointment; onChanged: () => void }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [showReschedule, setShowReschedule] = useState(false);
  const [date, setDate] = useState<Date>(appointment.startsAt);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const canManage = appointment.status === "CONFIRMED";
  const cancellationAllowed = appointment.startsAt.getTime() - Date.now() >= 24 * 60 * 60 * 1000;

  const loadSlots = (nextDate: Date) => {
    setDate(nextDate);
    setSelectedSlot("");
    setLoadingSlots(true);
    fetch(`/api/slots?doctorId=${appointment.doctor.id}&serviceId=${appointment.service.id}&date=${format(nextDate, "yyyy-MM-dd")}`)
      .then(async (response) => response.ok ? response.json() : { slots: [] })
      .then((data: { slots: string[] }) => setSlots(data.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  };

  const cancel = () => {
    setMessage("");
    startTransition(async () => {
      const result = await cancelAppointment(appointment.id);
      setMessage(result.message ?? "");
      if (result.success) onChanged();
    });
  };

  const reschedule = () => {
    if (!selectedSlot) return;
    setMessage("");
    startTransition(async () => {
      const result = await rescheduleAppointment({ appointmentId: appointment.id, startsAt: selectedSlot });
      setMessage(result.message ?? "");
      if (result.success) onChanged();
    });
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{appointment.service.name}</h2>
              <Badge variant={statusVariant(appointment.status)}>{statusLabel(appointment.status)}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">with {appointment.doctor.name}</p>
            <p className="mt-1 flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-primary" />
              {format(appointment.startsAt, "EEEE, MMMM d, yyyy")}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm">
              <Clock3 className="h-4 w-4 text-primary" />
              {format(appointment.startsAt, "h:mm a")} ({appointment.service.durationMin} min)
            </p>
          </div>
          {canManage && (
            <div className="flex flex-wrap items-start gap-2">
              <Button variant="outline" onClick={() => setShowReschedule(!showReschedule)} disabled={pending || !cancellationAllowed}>
                Reschedule
              </Button>
              <Button variant="destructive" onClick={cancel} disabled={pending || !cancellationAllowed}>
                Cancel
              </Button>
            </div>
          )}
        </div>
        {canManage && !cancellationAllowed && (
          <p className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Changes are blocked within 24 hours of the appointment start time.
          </p>
        )}
        {showReschedule && cancellationAllowed && (
          <div className="mt-5 grid gap-5 border-t pt-5 md:grid-cols-[auto_1fr]">
            <div>
              <p className="mb-2 text-sm font-medium">Choose a date</p>
              <Calendar mode="single" selected={date} onSelect={(next) => next && loadSlots(next)} disabled={{ before: new Date() }} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Available times</p>
              {loadingSlots ? <p className="text-sm text-muted-foreground">Loading available times...</p> : slots.length ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {slots.map((slot) => <Button key={slot} type="button" variant={selectedSlot === slot ? "default" : "outline"} onClick={() => setSelectedSlot(slot)}>{new Date(slot).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</Button>)}
                </div>
              ) : <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">No times available for this date.</p>}
              <Button className="mt-4" onClick={reschedule} disabled={pending || !selectedSlot}>Save new time</Button>
            </div>
          </div>
        )}
        {message && <p role="status" className="mt-4 text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  );
}

export function DashboardClient({ appointments, user }: Props) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const now = useMemo(() => Date.now(), []);
  const upcoming = appointments.filter((appointment) => appointment.startsAt.getTime() >= now && appointment.status !== "CANCELLED");
  const past = appointments.filter((appointment) => appointment.startsAt.getTime() < now || appointment.status === "CANCELLED");
  const refresh = () => {
    setRefreshKey((key) => key + 1);
    router.refresh();
  };
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Patient dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Welcome, {user.name}</h1>
          <p className="mt-2 text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/dashboard/profile">Profile</Link></Button>
          <Button asChild><Link href="/book">Book appointment</Link></Button>
        </div>
      </div>
      <section className="mt-10 space-y-4" aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className="text-xl font-semibold">Upcoming appointments</h2>
        {upcoming.length ? upcoming.map((appointment) => <AppointmentCard key={`${appointment.id}-${refreshKey}`} appointment={appointment} onChanged={refresh} />) : <Card><CardContent className="p-8 text-center text-muted-foreground"><CheckCircle2 className="mx-auto h-8 w-8 text-primary" /><p className="mt-3">You have no upcoming appointments.</p></CardContent></Card>}
      </section>
      <section className="mt-12 space-y-4" aria-labelledby="past-heading">
        <h2 id="past-heading" className="text-xl font-semibold">Past appointments</h2>
        {past.length ? past.map((appointment) => <AppointmentCard key={`${appointment.id}-${refreshKey}`} appointment={appointment} onChanged={refresh} />) : <Card><CardContent className="p-8 text-center text-muted-foreground"><XCircle className="mx-auto h-8 w-8" /><p className="mt-3">No past appointments yet.</p></CardContent></Card>}
      </section>
    </main>
  );
}
