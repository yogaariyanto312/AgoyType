import { prisma } from "@/lib/prisma";

export interface UserStatsSummary {
  totalTests: number;
  timeTypingSeconds: number;
  totalKeystrokes: number;
  avgWpm: number;
  avgAccuracy: number;
  highestWpm: number;
}

export async function getUserStatsSummary(
  userId: string,
): Promise<UserStatsSummary> {
  const agg = await prisma.result.aggregate({
    where: { userId, flagged: false },
    _count: { _all: true },
    _avg: { wpm: true, accuracy: true },
    _max: { wpm: true },
    _sum: { duration: true, keystrokes: true },
  });

  return {
    totalTests: agg._count._all,
    timeTypingSeconds: Math.round(agg._sum.duration ?? 0),
    totalKeystrokes: agg._sum.keystrokes ?? 0,
    avgWpm: Math.round((agg._avg.wpm ?? 0) * 10) / 10,
    avgAccuracy: Math.round((agg._avg.accuracy ?? 0) * 10) / 10,
    highestWpm: Math.round(agg._max.wpm ?? 0),
  };
}

export async function getDailyStatSeries(userId: string, days = 60) {
  const since = new Date(Date.now() - days * 86400000);
  since.setUTCHours(0, 0, 0, 0);
  const rows = await prisma.dailyStat.findMany({
    where: { userId, day: { gte: since } },
    orderBy: { day: "asc" },
    select: {
      day: true,
      testsCompleted: true,
      bestWpm: true,
      totalWpm: true,
      timeTyping: true,
    },
  });
  return rows.map((r) => ({
    day: r.day.toISOString().slice(0, 10),
    tests: r.testsCompleted,
    bestWpm: Math.round(r.bestWpm),
    avgWpm:
      r.testsCompleted > 0
        ? Math.round((r.totalWpm / r.testsCompleted) * 10) / 10
        : 0,
    minutes: Math.round(r.timeTyping / 60),
  }));
}

export async function getPersonalBests(userId: string) {
  return prisma.personalBest.findMany({
    where: { userId },
    orderBy: [{ mode: "asc" }, { wpm: "desc" }],
    select: {
      mode: true,
      mode2: true,
      language: true,
      wpm: true,
      rawWpm: true,
      accuracy: true,
      consistency: true,
      achievedAt: true,
    },
  });
}

export async function getRecentResults(userId: string, limit = 20) {
  return prisma.result.findMany({
    where: { userId },
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
}

export async function getUserAchievements(userId: string) {
  return prisma.userAchievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: "desc" },
    select: {
      unlockedAt: true,
      achievement: {
        select: { key: true, name: true, description: true, icon: true, tier: true },
      },
    },
  });
}
