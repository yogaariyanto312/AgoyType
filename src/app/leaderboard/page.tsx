import type { Metadata } from "next";
import { getLeaderboard } from "@/lib/leaderboard";
import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";

export const metadata: Metadata = { title: "Leaderboard" };
export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const initialEntries = await getLeaderboard({
    period: "alltime",
    mode: "TIME",
    mode2: "time:60",
    limit: 100,
  });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          The fastest typists, ranked by best result per category.
        </p>
      </div>
      <LeaderboardView
        initialEntries={initialEntries}
        initialPeriod="alltime"
        initialCategory="time:60"
      />
    </div>
  );
}
