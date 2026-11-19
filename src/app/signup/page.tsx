"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "./actions";

const schema = z.object({ name: z.string().min(2, "Enter your full name."), email: z.string().email("Enter a valid email address."), password: z.string().min(8, "Use at least 8 characters.") });
type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const onSubmit = async (values: FormValues) => { const result = await registerUser(values); if (!result.success) { setError(result.field ?? "root", { message: result.message }); return; } router.push("/login?registered=1"); };
  return <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12"><Card className="w-full max-w-md"><CardHeader className="text-center"><Link href="/" className="mx-auto flex items-center gap-2 text-lg font-bold"><HeartPulse className="h-5 w-5 text-primary" />Care<span className="text-primary">Slot</span></Link><CardTitle className="mt-5 text-2xl">Create your account</CardTitle><CardDescription>Book and manage your care in one place.</CardDescription></CardHeader><CardContent><form onSubmit={handleSubmit(onSubmit)} className="space-y-5"><div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" autoComplete="name" {...register("name")} />{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}</div><div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" autoComplete="email" {...register("email")} />{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}</div><div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="new-password" {...register("password")} />{errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}</div>{errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}<Button className="w-full" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}</Button></form><p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link></p><Link href="/" className="mt-5 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" />Back to home</Link></CardContent></Card></main>;
}
