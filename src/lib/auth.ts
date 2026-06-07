import { type NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import "./env"; // validate environment (fails closed in production)
import { prisma } from "./prisma";
import { loginSchema } from "./validations";
import { rateLimit, getClientIp } from "./rate-limit";
import type { Role } from "@prisma/client";

const googleEnabled =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

const isProd = process.env.NODE_ENV === "production";

// A real (cost-12) bcrypt hash of an unknown random string, so the
// "user not found" path still performs a full bcrypt comparison — equalising
// response time and preventing username enumeration via timing.
const DUMMY_BCRYPT_HASH =
  "$2a$12$IdIsger/4Mqznt4HpXQsSeNlI7tZvKxov7JPkOlrm9AhidALlTGUW";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // JWT sessions: keep the lifetime modest so role changes / bans take effect
  // reasonably quickly (a JWT cannot be revoked server-side before it expires).
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // refresh once per day
  },
  // Belt-and-suspenders: only send the secure cookie over HTTPS in production.
  useSecureCookies: isProd && process.env.NEXTAUTH_URL?.startsWith("https://"),
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // Do NOT auto-link Google logins to an existing account with the
            // same email: this app has no email-verification flow, so an
            // attacker could pre-register a victim's email/password and have it
            // silently linked when the victim later signs in with Google.
            allowDangerousEmailAccountLinking: false,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // Throttle credential brute-force: by IP and by target email.
        const ip = getClientIp(req?.headers ?? {});
        const ipLimit = rateLimit(`login:ip:${ip}`, 20, 5 * 60 * 1000);
        const emailLimit = rateLimit(
          `login:email:${parsed.data.email}`,
          10,
          15 * 60 * 1000,
        );
        if (!ipLimit.success || !emailLimit.success) {
          throw new Error("Too many attempts. Please try again later.");
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        // Always run a bcrypt comparison to keep timing constant whether or not
        // the account exists (mitigates user enumeration via response time).
        const hash = user?.password ?? DUMMY_BCRYPT_HASH;
        const valid = await bcrypt.compare(parsed.data.password, hash);

        if (!user || !user.password || user.banned || !valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? "USER";
        token.username = (user as { username?: string | null }).username ?? null;
      }
      // refresh role/username from DB when the client calls `update()`
      if (trigger === "update" && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, username: true, name: true, image: true },
        });
        if (fresh) {
          token.role = fresh.role;
          token.username = fresh.username;
          token.name = fresh.name;
          token.picture = fresh.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) ?? "USER";
        session.user.username = (token.username as string | null) ?? null;
      }
      return session;
    },
  },
  events: {
    // give OAuth-created users a unique username derived from their profile
    async createUser({ user }) {
      const base =
        (user.name ?? user.email?.split("@")[0] ?? "user")
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "")
          .slice(0, 16) || "user";

      let candidate = base;
      let suffix = 0;
      // ensure uniqueness
      while (await prisma.user.findUnique({ where: { username: candidate } })) {
        suffix += 1;
        candidate = `${base}${suffix}`;
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { username: candidate },
      });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Resolve the current user and confirm they still exist and are not banned.
 * Use on state-changing endpoints so a banned user holding a still-valid JWT
 * cannot keep writing. Returns null when there is no active, allowed user.
 */
export async function getActiveUser() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser?.id) return null;
  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, banned: true },
  });
  if (!dbUser || dbUser.banned) return null;
  return sessionUser;
}

export const isGoogleEnabled = googleEnabled;
