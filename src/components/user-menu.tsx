"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown, LogOut, Shield, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function UserMenu({ className }: { className?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  if (status === "loading") return <div className={cn("h-10 w-24 animate-pulse rounded-lg bg-muted", className)} />;
  if (!session?.user) return <div className={cn("hidden items-center gap-3 md:flex", className)}><Button variant="ghost" asChild><Link href="/login">Log in</Link></Button><Button asChild><Link href="/signup">Create account</Link></Button></div>;
  return <div className={className}><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="gap-2"><UserRound className="h-4 w-4" /><span className="hidden max-w-28 truncate sm:inline">{session.user.name ?? session.user.email}</span><ChevronDown className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem asChild><Link href="/dashboard"><UserRound className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>{session.user.role === "ADMIN" && <DropdownMenuItem asChild><Link href="/admin"><Shield className="mr-2 h-4 w-4" />Admin area</Link></DropdownMenuItem>}<DropdownMenuItem onSelect={async () => { await signOut({ redirect: false }); router.push("/"); router.refresh(); }}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>;
}
