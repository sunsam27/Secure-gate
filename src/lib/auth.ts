import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { loginSchema } from "./validations";
import { checkLoginRateLimit } from "./rate-limit";
import { headers } from "next/headers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Rate limiting by IP
        try {
          const headersList = await headers();
          const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
          const rateLimit = await checkLoginRateLimit(ip);
          if (!rateLimit.success) {
            throw new Error("Too many attempts. Please try again later.");
          }
        } catch (e) {
          if (e instanceof Error && e.message.includes("Too many")) throw e;
          // If rate limiting fails, continue (fail open)
        }

        // Validate input
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Look up user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        // Compare password with bcrypt hash
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
});
