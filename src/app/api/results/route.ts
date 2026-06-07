import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActiveUser } from "@/lib/auth";
import { submitResultSchema } from "@/lib/validations";
import { evaluateResult } from "@/lib/anti-cheat";
import { evaluateAchievements } from "@/lib/achievements";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const user = await getActiveUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 60 results / minute / user
  const rl = rateLimit(`results:${user.id}`, 60, 60 * 1000);
  if (!rl.success) {
    return NextResponse.json({ error: "Slow down" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = submitResultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid result" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // anti-cheat: recompute & validate
  const verdict = evaluateResult(data);

  try {
  // create the result
  const result = await prisma.result.create({
    data: {
      userId: user.id,
      wpm: data.wpm,
      rawWpm: data.rawWpm,
      accuracy: data.accuracy,
      consistency: data.consistency,
      errors: data.errors,
      keystrokes: data.keystrokes,
      mode: data.mode,
      mode2: data.mode2,
      language: data.language,
      duration: data.duration,
      testText: data.testText,
      charStats: data.charStats,
      rawData: data.rawData,
      flagged: verdict.flagged,
      flagReason: verdict.reason,
    },
  });

  // aggregate into the user's daily stat row
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  await prisma.dailyStat.upsert({
    where: { userId_day: { userId: user.id, day } },
    update: {
      testsCompleted: { increment: 1 },
      timeTyping: { increment: data.duration },
      totalWpm: { increment: data.wpm },
      keystrokes: { increment: data.keystrokes },
    },
    create: {
      userId: user.id,
      day,
      testsCompleted: 1,
      timeTyping: data.duration,
      totalWpm: data.wpm,
      bestWpm: data.wpm,
      keystrokes: data.keystrokes,
    },
  });
  // bump bestWpm for the day if needed (separate query to use a conditional max)
  await prisma.dailyStat.updateMany({
    where: { userId: user.id, day, bestWpm: { lt: data.wpm } },
    data: { bestWpm: data.wpm },
  });

  let isPersonalBest = false;

  // only clean (non-flagged) results are eligible for records
  if (!verdict.flagged) {
    const existing = await prisma.personalBest.findUnique({
      where: {
        userId_mode_mode2_language: {
          userId: user.id,
          mode: data.mode,
          mode2: data.mode2,
          language: data.language,
        },
      },
    });

    if (!existing || data.wpm > existing.wpm) {
      isPersonalBest = true;
      await prisma.personalBest.upsert({
        where: {
          userId_mode_mode2_language: {
            userId: user.id,
            mode: data.mode,
            mode2: data.mode2,
            language: data.language,
          },
        },
        update: {
          wpm: data.wpm,
          rawWpm: data.rawWpm,
          accuracy: data.accuracy,
          consistency: data.consistency,
          resultId: result.id,
          achievedAt: new Date(),
        },
        create: {
          userId: user.id,
          mode: data.mode,
          mode2: data.mode2,
          language: data.language,
          wpm: data.wpm,
          rawWpm: data.rawWpm,
          accuracy: data.accuracy,
          consistency: data.consistency,
          resultId: result.id,
        },
      });
      await prisma.result.update({
        where: { id: result.id },
        data: { isPersonalBest: true },
      });
      // A new personal best is the only thing that can change leaderboard
      // ordering, so refresh the cached leaderboard.
      revalidateTag("leaderboard");
    }
  }

  // achievements
  const newAchievements: string[] = [];
  if (!verdict.flagged) {
    const [totalTests, unlocked] = await Promise.all([
      prisma.result.count({ where: { userId: user.id, flagged: false } }),
      prisma.userAchievement.findMany({
        where: { userId: user.id },
        select: { achievement: { select: { key: true } } },
      }),
    ]);
    const unlockedKeys = new Set(unlocked.map((u) => u.achievement.key));

    const keys = evaluateAchievements(
      {
        wpm: data.wpm,
        accuracy: data.accuracy,
        consistency: data.consistency,
        keystrokes: data.keystrokes,
        durationSeconds: data.duration,
        totalTests,
      },
      unlockedKeys,
    );

    if (keys.length > 0) {
      const achievements = await prisma.achievement.findMany({
        where: { key: { in: keys } },
        select: { id: true, name: true, key: true },
      });
      for (const ach of achievements) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: { userId: user.id, achievementId: ach.id },
          },
          update: {},
          create: { userId: user.id, achievementId: ach.id },
        });
        newAchievements.push(ach.name);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    id: result.id,
    flagged: verdict.flagged,
    isPersonalBest,
    newAchievements,
  });
  } catch (err) {
    console.error("[results] failed to persist result:", err);
    return NextResponse.json(
      { error: "Could not save result. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const user = await getActiveUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "30", 10);
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 100)
    : 30;

  const results = await prisma.result.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      wpm: true,
      rawWpm: true,
      accuracy: true,
      consistency: true,
      mode: true,
      mode2: true,
      language: true,
      duration: true,
      flagged: true,
      isPersonalBest: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ results });
}
