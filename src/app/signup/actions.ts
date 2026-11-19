"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { allowAuthAttempt } from "@/lib/rate-limit";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z.string().min(8, "Use at least 8 characters.").max(72),
});

export type SignupResult = { success: true } | { success: false; message: string; field?: keyof z.infer<typeof signupSchema> };

export async function registerUser(input: unknown): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { success: false, message: issue.message, field: issue.path[0] as keyof z.infer<typeof signupSchema> };
  }

  if (!allowAuthAttempt(`signup:${parsed.data.email.toLowerCase()}`)) {
    return { success: false, message: "Too many attempts. Please try again later." };
  }

  const email = parsed.data.email.toLowerCase();
  const passwordHash = await hash(parsed.data.password, 12);
  try {
    await db.user.create({ data: { name: parsed.data.name, email, passwordHash } });
  } catch (error) {
    if (error instanceof Error && error.constructor.name === "PrismaClientKnownRequestError") {
      return { success: false, message: "Unable to create your account with those details." };
    }
    throw error;
  }
  return { success: true };
}
