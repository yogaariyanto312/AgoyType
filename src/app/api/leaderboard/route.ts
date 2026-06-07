import { NextResponse } from "next/server";
import { leaderboardQuerySchema } from "@/lib/validations";
import { getLeaderboard, type LeaderboardPeriod } from "@/lib/leaderboard";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = leaderboardQuerySchema.safeParse({
    period: searchParams.get("period") ?? undefined,
    mode: searchParams.get("mode") ?? undefined,
    mode2: searchParams.get("mode2") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { period, mode, mode2, limit } = parsed.data;
  const entries = await getLeaderboard({
    period: period as LeaderboardPeriod,
    mode,
    mode2,
    limit,
  });

  return NextResponse.json({ entries });
}
