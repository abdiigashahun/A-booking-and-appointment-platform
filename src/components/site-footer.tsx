import Link from "next/link";
import { Globe, HeartPulse, Mail, MessageCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-2 text-lg font-bold"><HeartPulse className="h-5 w-5 text-primary" />Care<span className="text-primary">Slot</span></Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">Thoughtful healthcare, made easier. Find the right care and book with confidence.</p>
          <div className="mt-5 flex gap-2">
            {[Globe, MessageCircle, Mail].map((Icon, index) => <Link key={index} href="#" aria-label={`CareSlot contact link ${index + 1}`} className="rounded-full border p-2 text-muted-foreground hover:bg-background hover:text-foreground"><Icon className="h-4 w-4" /></Link>)}
          </div>
        </div>
        <div><h2 className="text-sm font-semibold">Explore</h2><div className="mt-4 grid gap-3 text-sm text-muted-foreground"><Link href="#services" className="hover:text-foreground">Services</Link><Link href="#doctors" className="hover:text-foreground">Our doctors</Link><Link href="#how-it-works" className="hover:text-foreground">How it works</Link></div></div>
        <div><h2 className="text-sm font-semibold">Support</h2><div className="mt-4 grid gap-3 text-sm text-muted-foreground"><Link href="#faq" className="hover:text-foreground">FAQs</Link><Link href="#" className="hover:text-foreground">Contact us</Link><Link href="#" className="hover:text-foreground">Privacy policy</Link></div></div>
        <div><h2 className="text-sm font-semibold">Visit us</h2><p className="mt-4 text-sm leading-6 text-muted-foreground">Bole Road<br />Addis Ababa, Ethiopia<br />Mon–Sat, 8am–6pm</p></div>
      </div>
      <div className="border-t"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span>© {new Date().getFullYear()} CareSlot. All rights reserved.</span><span>Made for better care.</span></div></div>
    </footer>
  );
}
