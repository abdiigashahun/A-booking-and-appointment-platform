"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { createAppointment } from "./actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Service = { id: string; name: string; description: string | null; durationMin: number; priceCents: number; depositCents: number };
type Doctor = { id: string; name: string; specialty: { name: string }; services: { serviceId: string }[] };

function useBookingParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const update = (values: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    router.push(`${pathname}?${next.toString()}`);
  };
  return { params, update };
}

export function BookingForm({ services, doctors }: { services: Service[]; doctors: Doctor[] }) {
  const { params, update } = useBookingParams();
  const router = useRouter();
  const { status } = useSession();
  const serviceId = params.get("service") ?? "";
  const doctorId = params.get("doctor") ?? "";
  const date = params.get("date") ?? format(new Date(), "yyyy-MM-dd");
  const startsAt = params.get("slot") ?? "";
  const step = Number(params.get("step") ?? (serviceId ? doctorId ? date && startsAt ? 4 : 3 : 2 : 1));
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const selectedService = services.find((service) => service.id === serviceId);
  const matchingDoctors = useMemo(() => doctors.filter((doctor) => doctor.services.some((item) => item.serviceId === serviceId)), [doctors, serviceId]);

  useEffect(() => {
    if (!serviceId || !date || !doctorId || step < 3) return;
    let active = true;
    setLoadingSlots(true);
    fetch(`/api/slots?doctorId=${encodeURIComponent(doctorId)}&serviceId=${encodeURIComponent(serviceId)}&date=${date}`)
      .then(async (response) => response.ok ? response.json() : { slots: [] })
      .then((data: { slots: string[] }) => { if (active) setSlots(data.slots); })
      .catch(() => { if (active) setSlots([]); })
      .finally(() => { if (active) setLoadingSlots(false); });
    return () => { active = false; };
  }, [date, doctorId, serviceId, step]);

  const chooseService = (id: string) => update({ service: id, doctor: undefined, date: undefined, slot: undefined, step: "2" });
  const chooseDoctor = (id: string) => update({ doctor: id, date: undefined, slot: undefined, step: "3" });
  const chooseDate = (selected?: Date) => selected && update({ date: format(selected, "yyyy-MM-dd"), slot: undefined, step: "3" });
  const submit = async () => {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/book?${params.toString()}`)}`);
      return;
    }
    setError("");
    const result = await createAppointment({ serviceId, doctorId, startsAt, notes });
    if (!result.success) {
      if (result.code === "UNAUTHENTICATED") router.push(`/login?callbackUrl=${encodeURIComponent(`/book?${params.toString()}`)}`);
      else { setError(result.message); update({ slot: undefined, step: "3" }); }
      return;
    }
    window.location.assign(result.checkoutUrl);
  };

  return <div className="mx-auto max-w-5xl">
    <div className="mb-8 grid grid-cols-4 gap-2">{["Service", "Doctor", "Time", "Review"].map((label, index) => <div key={label} className={`border-t-2 pt-2 text-xs font-medium sm:text-sm ${step >= index + 1 ? "border-primary text-primary" : "border-border text-muted-foreground"}`}><span className="mr-1">{index + 1}.</span>{label}</div>)}</div>
    {error && <div role="alert" className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
    {step === 1 && <Card><CardHeader><CardTitle>What kind of care do you need?</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">{services.map((service) => <button key={service.id} type="button" onClick={() => chooseService(service.id)} className="rounded-xl border p-4 text-left transition hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring"><h2 className="font-semibold">{service.name}</h2><p className="mt-1 text-sm text-muted-foreground">{service.description}</p><p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5 text-primary" /> {service.durationMin} minutes</p></button>)}</CardContent></Card>}
    {step === 2 && <Card><CardHeader><CardTitle>Choose your doctor</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2"><button type="button" onClick={() => chooseDoctor("any")} className="rounded-xl border border-primary/40 bg-primary/5 p-4 text-left hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring"><h2 className="font-semibold">Any available doctor</h2><p className="mt-1 text-sm text-muted-foreground">Show the earliest available appointment with our care team.</p></button>{matchingDoctors.map((doctor) => <button key={doctor.id} type="button" onClick={() => chooseDoctor(doctor.id)} className="rounded-xl border p-4 text-left hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring"><h2 className="font-semibold">{doctor.name}</h2><p className="mt-1 text-sm text-muted-foreground">{doctor.specialty.name}</p></button>)}</CardContent></Card>}
    {step === 3 && <Card><CardHeader><CardTitle>Pick a date and time</CardTitle></CardHeader><CardContent className="grid gap-6 md:grid-cols-[auto_1fr]"><div><Label className="mb-2 block">Appointment date</Label><Calendar mode="single" selected={parseISO(date)} onSelect={chooseDate} disabled={{ before: new Date() }} /></div><div><Label className="mb-2 block">Available times</Label>{loadingSlots ? <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading availability...</div> : slots.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{slots.map((slot) => <Button key={slot} type="button" variant={slot === startsAt ? "default" : "outline"} onClick={() => update({ slot, step: "4" })}>{new Date(slot).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</Button>)}</div> : <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No times available for this date. Try another day.</div>}</div></CardContent></Card>}
    {step === 4 && selectedService && <Card><CardHeader><CardTitle>Review your appointment</CardTitle></CardHeader><CardContent className="space-y-6"><div className="grid gap-4 rounded-xl bg-muted/50 p-4 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Service</p><p className="mt-1 font-medium">{selectedService.name}</p></div><div><p className="text-xs text-muted-foreground">Date and time</p><p className="mt-1 font-medium">{format(parseISO(startsAt), "MMM d, yyyy · h:mm a")}</p></div><div><p className="text-xs text-muted-foreground">Duration</p><p className="mt-1 font-medium">{selectedService.durationMin} minutes</p></div></div><div className="space-y-2"><Label htmlFor="notes">Notes <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anything you would like your care team to know?" maxLength={1000} /></div><div className="flex flex-col-reverse justify-between gap-3 sm:flex-row"><Button variant="outline" onClick={() => update({ slot: undefined, step: "3" })}><ChevronLeft className="mr-2 h-4 w-4" />Change time</Button><Button onClick={submit} disabled={status === "loading"}>{status === "authenticated" ? "Confirm appointment" : "Log in to confirm"}<ChevronRight className="ml-2 h-4 w-4" /></Button></div></CardContent></Card>}
    {step > 1 && <Button variant="ghost" className="mt-4" onClick={() => update(step === 2 ? { service: undefined, step: "1" } : step === 3 ? { doctor: undefined, date: undefined, slot: undefined, step: "2" } : { slot: undefined, step: "3" })}><ChevronLeft className="mr-2 h-4 w-4" />Back</Button>}
  </div>;
}
