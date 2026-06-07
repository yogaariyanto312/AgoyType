import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { TestMode } from "@prisma/client";
import type { LeaderboardEntry } from "@/types";

export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "alltime";

export function periodStart(period: LeaderboardPeriod): Date | null {
  const now = new Date();
  switch (period) {
    case "daily": {
      const d = new Date(now);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }
    case "weekly":
      return new Date(now.getTime() - 7 * 86400000);
    case "monthly":
      return new Date(now.getTime() - 30 * 86400000);
    case "alltime":
      return null;
  }
}

interface GetLeaderboardOptions {
  period: LeaderboardPeriod;
  mode?: TestMode;
  mode2?: string;
  limit?: number;
}

/**
 * Returns the ranked best (non-flagged) result per user for the requested
 * period and test category. Dedupes per user in application code after pulling
 * a bounded, index-ordered candidate set.
 *
 * The result is identical for every visitor, so it is cached for a short window
 * (per period/mode/mode2/limit) to avoid re-running the heavy candidate scan on
 * every page load and filter change.
 */
export async function getLeaderboard(
  opts: GetLeaderboardOptions,
): Promise<LeaderboardEntry[]> {
  const { period, mode = "TIME", mode2 = "time:60", limit = 50 } = opts;
  const cacheKey = `leaderboard:${period}:${mode}:${mode2}:${limit}`;
  return unstable_cache(
    () => queryLeaderboard({ period, mode, mode2, limit }),
    [cacheKey],
    { revalidate: 30, tags: ["leaderboard"] },
  )();
}

async function queryLeaderboard({
  period,
  mode = "TIME",
  mode2 = "time:60",
  limit = 50,
}: GetLeaderboardOptions): Promise<LeaderboardEntry[]> {
  const start = periodStart(period);

  const candidates = await prisma.result.findMany({
    where: {
      flagged: false,
      mode,
      mode2,
      ...(start ? { createdAt: { gte: start } } : {}),
      user: { banned: false },
    },
    orderBy: { wpm: "desc" },
    take: Math.min(1000, limit * 20),
    select: {
      wpm: true,
      rawWpm: true,
      accuracy: true,
      consistency: true,
      mode: true,
      mode2: true,
      createdAt: true,
      userId: true,
      user: { select: { username: true, image: true } },
    },
  });

  const seen = new Set<string>();
  const entries: LeaderboardEntry[] = [];
  for (const c of candidates) {
    if (seen.has(c.userId)) continue;
    seen.add(c.userId);
    entries.push({
      rank: entries.length + 1,
      userId: c.userId,
      username: c.user.username,
      image: c.user.image,
      wpm: c.wpm,
      rawWpm: c.rawWpm,
      accuracy: c.accuracy,
      consistency: c.consistency,
      mode: c.mode,
      mode2: c.mode2,
      createdAt: c.createdAt.toISOString(),
    });
    if (entries.length >= limit) break;
  }

  return entries;
}
