"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="flex min-h-[70vh] items-center justify-center px-4"><div className="max-w-md text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><AlertCircle className="h-8 w-8" /></div><h1 className="mt-6 text-3xl font-bold tracking-tight">Something went wrong</h1><p className="mt-3 text-muted-foreground">We couldn&apos;t load this page. Please try again or return home.</p><div className="mt-7 flex justify-center gap-3"><Button onClick={reset}><RefreshCcw className="mr-2 h-4 w-4" />Try again</Button><Button variant="outline" asChild><Link href="/">Home</Link></Button></div></div></main>;
}
