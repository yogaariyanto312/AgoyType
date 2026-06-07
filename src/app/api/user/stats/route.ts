import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserStatsSummary,
  getDailyStatSeries,
  getPersonalBests,
} from "@/lib/user-stats";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [summary, series, personalBests] = await Promise.all([
    getUserStatsSummary(user.id),
    getDailyStatSeries(user.id),
    getPersonalBests(user.id),
  ]);

  return NextResponse.json({ summary, series, personalBests });
}
