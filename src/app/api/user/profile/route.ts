import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveUser } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations";

export async function PATCH(req: Request) {
  const user = await getActiveUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        bio: parsed.data.bio,
        keyboard: parsed.data.keyboard,
      },
      select: { bio: true, keyboard: true },
    });
    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("[profile] failed to update profile:", err);
    return NextResponse.json(
      { error: "Could not update profile." },
      { status: 500 },
    );
  }
}
