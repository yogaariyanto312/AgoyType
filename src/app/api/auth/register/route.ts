import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // 5 registrations per 10 minutes per IP
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`register:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (existing) {
    const field = existing.email === email ? "Email" : "Username";
    return NextResponse.json(
      { error: `${field} is already taken` },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        name: username,
        email,
        password: passwordHash,
      },
      select: { id: true, username: true, email: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    // Unique-constraint race: two concurrent signups passed the check above and
    // collided on the email/username unique index.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email or username is already taken" },
        { status: 409 },
      );
    }
    console.error("[register] failed to create user:", err);
    return NextResponse.json(
      { error: "Could not create account. Please try again." },
      { status: 500 },
    );
  }
}
