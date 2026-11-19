import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="mx-auto min-h-screen max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 w-full rounded-3xl" /><div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div></main>;
}
