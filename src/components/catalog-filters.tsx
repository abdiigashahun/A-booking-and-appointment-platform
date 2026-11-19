"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CatalogFilters({ specialties }: { specialties: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(key, value); else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  };
  return <div className="grid gap-3 sm:grid-cols-[1fr_220px]"><Input defaultValue={params.get("q") ?? ""} onChange={(event) => update("q", event.target.value)} placeholder="Search doctors..." aria-label="Search doctors" /><Select defaultValue={params.get("specialty") ?? "all"} onValueChange={(value) => update("specialty", value)}><SelectTrigger><SelectValue placeholder="All specialties" /></SelectTrigger><SelectContent><SelectItem value="all">All specialties</SelectItem>{specialties.map((specialty) => <SelectItem key={specialty.id} value={specialty.id}>{specialty.name}</SelectItem>)}</SelectContent></Select></div>;
}
