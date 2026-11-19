"use client";

import Link from "next/link";
import { Menu, Stethoscope, X } from "lucide-react";
import { useState } from "react";
import { UserMenu } from "@/components/user-menu";

const links = [
  { label: "Services", href: "#services" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Our doctors", href: "#doctors" },
  { label: "FAQ", href: "#faq" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="CareSlot home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">Care<span className="text-primary">Slot</span></span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map((link) => <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{link.label}</Link>)}
        </nav>

        <UserMenu className="flex md:hidden" />

        <button type="button" className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="border-t bg-background px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">{link.label}</Link>)}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-4">
              <UserMenu />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
