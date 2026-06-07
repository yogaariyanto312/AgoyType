import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Activity, Clock, Gauge, Target, Hash, Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserStatsSummary,
  getDailyStatSeries,
  getPersonalBests,
  getRecentResults,
  getUserAchievements,
} from "@/lib/user-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressChart } from "@/components/charts/progress-chart";
import { HistoryTable } from "@/components/account/history-table";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-tt-main/10 text-tt-main">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="font-mono text-xl font-semibold leading-none">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/account");

  const [summary, series, pbs, recent, achievements] = await Promise.all([
    getUserStatsSummary(user.id),
    getDailyStatSeries(user.id),
    getPersonalBests(user.id),
    getRecentResults(user.id, 25),
    getUserAchievements(user.id),
  ]);

  const chartData = series.map((s) => ({
    day: s.day,
    bestWpm: s.bestWpm,
    avgWpm: s.avgWpm,
  }));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {user.username ?? user.name}
        </h1>
        <p className="text-muted-foreground">Your lifetime typing stats and history.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Hash} label="tests" value={summary.totalTests} />
        <StatCard icon={Clock} label="time typing" value={formatTime(summary.timeTypingSeconds)} />
        <StatCard icon={Gauge} label="avg wpm" value={summary.avgWpm} />
        <StatCard icon={Activity} label="best wpm" value={summary.highestWpm} />
        <StatCard icon={Target} label="avg acc" value={`${summary.avgAccuracy}%`} />
        <StatCard icon={Trophy} label="achievements" value={achievements.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressChart data={chartData} />
        </CardContent>
      </Card>

      {pbs.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-semibold">Personal bests</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {pbs.map((pb) => (
              <Card key={`${pb.mode}-${pb.mode2}-${pb.language}`}>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground">{pb.mode2}</div>
                  <div className="font-mono text-3xl font-bold text-tt-main">
                    {Math.round(pb.wpm)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(pb.accuracy)}% acc · {Math.round(pb.consistency)}% con
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {achievements.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-semibold">Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {achievements.map((a) => (
              <Badge key={a.achievement.key} variant="secondary" className="gap-1.5 py-1">
                <Trophy className="h-3 w-3 text-tt-main" />
                {a.achievement.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-xl font-semibold">Recent tests</h2>
        <HistoryTable rows={recent} />
      </div>
    </div>
  );
}
