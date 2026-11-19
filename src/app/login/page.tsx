"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({ email: z.string().email("Enter a valid email address."), password: z.string().min(1, "Enter your password.") });
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const onSubmit = async (values: FormValues) => { const result = await signIn("credentials", { ...values, redirect: false }); if (!result || result.error) { setError("root", { message: "Invalid email or password." }); return; } const callbackUrl = searchParams.get("callbackUrl"); router.push(callbackUrl?.startsWith("/") ? callbackUrl : "/dashboard"); router.refresh(); };
  return <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12"><Card className="w-full max-w-md"><CardHeader className="text-center"><Link href="/" className="mx-auto flex items-center gap-2 text-lg font-bold"><HeartPulse className="h-5 w-5 text-primary" />Care<span className="text-primary">Slot</span></Link><CardTitle className="mt-5 text-2xl">Welcome back</CardTitle><CardDescription>{searchParams.get("registered") ? "Your account is ready. Log in to continue." : "Log in to manage your appointments."}</CardDescription></CardHeader><CardContent><form onSubmit={handleSubmit(onSubmit)} className="space-y-5"><div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" autoComplete="email" {...register("email")} />{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}</div><div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" {...register("password")} />{errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}</div>{errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}<Button className="w-full" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Log in"}</Button></form><p className="mt-6 text-center text-sm text-muted-foreground">New to CareSlot? <Link href="/signup" className="font-semibold text-primary hover:underline">Create an account</Link></p><Link href="/" className="mt-5 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" />Back to home</Link></CardContent></Card></main>;
}
