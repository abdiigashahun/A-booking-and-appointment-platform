import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, ChevronDown, Clock3, HeartPulse, ShieldCheck, Sparkles, Stethoscope, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const services = [
  { icon: HeartPulse, title: "General check-ups", text: "Preventive care and friendly guidance to keep you feeling your best.", color: "bg-teal-50 text-teal-600" },
  { icon: Stethoscope, title: "Specialist care", text: "Connect with trusted specialists who listen and put your needs first.", color: "bg-blue-50 text-blue-600" },
  { icon: Video, title: "Video consultations", text: "Talk to your doctor from the comfort of home, wherever you are.", color: "bg-violet-50 text-violet-600" },
];

const doctors = [
  { initials: "AK", name: "Dr. Amina Kebede", specialty: "Family medicine", tone: "bg-teal-100 text-teal-700" },
  { initials: "MN", name: "Dr. Michael Nuru", specialty: "Internal medicine", tone: "bg-blue-100 text-blue-700" },
  { initials: "SH", name: "Dr. Sara Hassan", specialty: "Pediatrics", tone: "bg-amber-100 text-amber-700" },
];

const faqs = [
  ["How quickly can I get an appointment?", "Many of our doctors have appointments available within 24 hours. Choose a service and browse the earliest times that work for you."],
  ["Do I need an account to book?", "You can explore our services without an account. Creating one lets you manage appointments, receive reminders, and keep your care history together."],
  ["Can I reschedule my appointment?", "Yes. You can reschedule or cancel from your CareSlot account up to 24 hours before your appointment."],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-teal-50/80 via-background to-blue-50/60">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
            <div className="relative">
              <Badge variant="success"><Sparkles className="mr-1.5 h-3.5 w-3.5" /> Care that fits your life</Badge>
              <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">Book your appointment <span className="text-primary">in under a minute.</span></h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">Quality healthcare is closer than you think. Find your doctor, choose a time that works, and get back to what matters.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button size="lg" asChild><Link href="/book">Find an appointment <ArrowRight className="ml-2 h-4 w-4" /></Link></Button><Button size="lg" variant="outline" asChild><Link href="#how-it-works">How it works</Link></Button></div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"><span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" /> Verified doctors</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure & private</span></div>
            </div>
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -left-4 top-12 h-24 w-24 rounded-3xl bg-primary/10" />
              <div className="absolute -bottom-5 -right-5 h-32 w-32 rounded-full bg-blue-100/70" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-3 shadow-xl shadow-teal-900/10 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-teal-100 via-cyan-50 to-blue-100">
                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-white/70 shadow-inner"><div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30"><HeartPulse className="h-14 w-14" /></div><div className="absolute -right-5 top-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-md">Your health, your way</div><div className="absolute -bottom-2 -left-8 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-md"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Available today</div></div>
                </div>
                <div className="flex items-center justify-between px-2 pb-1 pt-4"><div><p className="text-xs text-muted-foreground">Next available</p><p className="mt-1 font-semibold">Today, 2:30 PM</p></div><div className="rounded-lg bg-primary/10 p-2 text-primary"><CalendarCheck className="h-5 w-5" /></div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wider text-primary">Care for every chapter</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Whatever you need, we&apos;re here.</h2><p className="mt-4 text-muted-foreground">From routine check-ups to specialist advice, access thoughtful care from a team you can trust.</p></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">{services.map((service) => <Card key={service.title} className="group border-border/60 transition-shadow hover:shadow-lg"><CardContent className="p-6"><div className={`flex h-12 w-12 items-center justify-center rounded-xl ${service.color}`}><service.icon className="h-6 w-6" /></div><h3 className="mt-5 text-lg font-semibold">{service.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{service.text}</p><Link href="/book" className="mt-5 inline-flex items-center text-sm font-semibold text-primary">Explore service <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></CardContent></Card>)}</div>
        </section>

        <section id="how-it-works" className="bg-slate-950 text-white"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wider text-teal-300">Simple by design</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Good care starts with less hassle.</h2></div><div className="mt-12 grid gap-10 md:grid-cols-3">{[["01", "Tell us what you need", "Choose a service or browse our doctors to find the right kind of care."], ["02", "Pick a time that works", "See real-time availability and select a convenient appointment slot."], ["03", "Show up feeling ready", "Get helpful reminders and everything you need before your visit."]].map(([number, title, text]) => <div key={number} className="relative border-l border-white/20 pl-6"><span className="text-sm font-bold text-teal-300">{number}</span><h3 className="mt-4 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{text}</p></div>)}</div></div></section>

        <section id="doctors" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-wider text-primary">Meet your care team</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">People who listen first.</h2></div><Link href="/doctors" className="inline-flex items-center text-sm font-semibold text-primary">Meet all doctors <ArrowRight className="ml-1.5 h-4 w-4" /></Link></div><div className="mt-10 grid gap-5 md:grid-cols-3">{doctors.map((doctor) => <Card key={doctor.name} className="overflow-hidden border-border/60"><CardContent className="p-0"><div className={`flex h-44 items-center justify-center ${doctor.tone}`}><span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/70 text-2xl font-bold shadow-sm">{doctor.initials}</span></div><div className="p-5"><h3 className="font-semibold">{doctor.name}</h3><p className="mt-1 text-sm text-muted-foreground">{doctor.specialty}</p><div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5 text-primary" /> Next available this week</div></div></CardContent></Card>)}</div></section>

        <section id="faq" className="border-y bg-muted/30"><div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8 lg:py-24"><div><p className="text-sm font-semibold uppercase tracking-wider text-primary">Questions, answered</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">We&apos;re here to help.</h2><p className="mt-4 text-muted-foreground">Can&apos;t find what you&apos;re looking for? <Link href="#" className="font-medium text-primary underline-offset-4 hover:underline">Talk to our team.</Link></p></div><div className="divide-y rounded-2xl border bg-background">{faqs.map(([question, answer]) => <details key={question} className="group p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:content-none">{question}<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" /></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-muted-foreground">{answer}</p></details>)}</div></div></section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12"><div className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full bg-white/10" /><div className="relative"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to make time for your health?</h2><p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">Your next appointment is just a few clicks away. Let&apos;s get you the care you deserve.</p><Button className="mt-7 bg-white text-primary hover:bg-white/90" size="lg" asChild><Link href="/book">Book an appointment <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
