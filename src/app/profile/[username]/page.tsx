import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Keyboard, Calendar, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getUserStatsSummary,
  getDailyStatSeries,
  getPersonalBests,
  getRecentResults,
  getUserAchievements,
} from "@/lib/user-stats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressChart } from "@/components/charts/progress-chart";
import { HistoryTable } from "@/components/account/history-table";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username}'s profile` };
}

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      bio: true,
      keyboard: true,
      createdAt: true,
      banned: true,
    },
  });

  if (!user || user.banned) notFound();

  const [summary, series, pbs, recent, achievements] = await Promise.all([
    getUserStatsSummary(user.id),
    getDailyStatSeries(user.id),
    getPersonalBests(user.id),
    getRecentResults(user.id, 15),
    getUserAchievements(user.id),
  ]);

  const chartData = series.map((s) => ({ day: s.day, bestWpm: s.bestWpm, avgWpm: s.avgWpm }));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            {user.image && <AvatarImage src={user.image} alt={user.username ?? ""} />}
            <AvatarFallback className="text-2xl">
              {(user.username ?? "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            {user.bio && <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>}
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {user.createdAt.toLocaleDateString()}
              </span>
              {user.keyboard && (
                <span className="flex items-center gap-1">
                  <Keyboard className="h-3.5 w-3.5" />
                  {user.keyboard}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <div className="font-mono text-3xl font-bold text-tt-main">
                {summary.highestWpm}
              </div>
              <div className="text-xs text-muted-foreground">best wpm</div>
            </div>
            <div>
              <div className="font-mono text-3xl font-bold">{summary.totalTests}</div>
              <div className="text-xs text-muted-foreground">tests</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <Card key={`${pb.mode}-${pb.mode2}`}>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground">{pb.mode2}</div>
                  <div className="font-mono text-3xl font-bold text-tt-main">
                    {Math.round(pb.wpm)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(pb.accuracy)}% acc
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
