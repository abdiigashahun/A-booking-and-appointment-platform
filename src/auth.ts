import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { allowAuthAttempt } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const forwardedFor = request.headers.get("x-forwarded-for");
        const address = forwardedFor?.split(",")[0]?.trim() ?? "unknown";
        if (!allowAuthAttempt(`login:${address}:${parsed.data.email.toLowerCase()}`)) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user || !(await compare(parsed.data.password, user.passwordHash))) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? token.sub ?? "";
        session.user.role = token.role ?? "PATIENT";
      }
      return session;
    },
  },
});
