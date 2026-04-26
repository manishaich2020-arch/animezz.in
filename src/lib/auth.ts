import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  // No adapter — we use JWT strategy with manual user lookup.
  // Google OAuth account linking is handled via the register flow if needed.
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // On Google sign-in, create/find user manually in the jwt callback
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // On initial sign-in, persist user data into the token
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "customer";
      }

      // Google OAuth — find or create user on first sign-in
      if (account?.provider === "google" && profile?.email) {
        const existing = await db.query.users.findFirst({
          where: eq(users.email, profile.email),
        });

        if (existing) {
          token.id = existing.id;
          token.role = existing.role;
        } else {
          // Auto-create account for Google users
          const [created] = await db
            .insert(users)
            .values({
              name: (profile.name as string) ?? profile.email,
              email: profile.email,
              avatarUrl: (profile as { picture?: string }).picture ?? null,
              role: "customer",
              isVerified: true,
            })
            .returning();
          token.id = created.id;
          token.role = created.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
