import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="flex min-h-[70vh] items-center justify-center px-4"><div className="max-w-md text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><SearchX className="h-8 w-8" /></div><h1 className="mt-6 text-3xl font-bold tracking-tight">We couldn&apos;t find that page</h1><p className="mt-3 text-muted-foreground">The page may have moved or the link might be out of date.</p><Button className="mt-7" asChild><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to home</Link></Button></div></main>;
}
