import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users, Keyboard, Flag, FileText, Quote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (user.role !== "ADMIN") redirect("/");

  const [userCount, resultCount, flaggedCount, wordLists, quotes, flagged, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.result.count(),
      prisma.result.count({ where: { flagged: true } }),
      prisma.wordList.count(),
      prisma.quote.count(),
      prisma.result.findMany({
        where: { flagged: true },
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          wpm: true,
          accuracy: true,
          mode2: true,
          flagReason: true,
          createdAt: true,
          user: { select: { username: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          banned: true,
          createdAt: true,
          _count: { select: { results: true } },
        },
      }),
    ]);

  const cards = [
    { icon: Users, label: "users", value: userCount },
    { icon: Keyboard, label: "results", value: resultCount },
    { icon: Flag, label: "flagged", value: flaggedCount },
    { icon: FileText, label: "word lists", value: wordLists },
    { icon: Quote, label: "quotes", value: quotes },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
        <p className="text-muted-foreground">Platform overview and moderation.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className="h-5 w-5 text-tt-main" />
                <div>
                  <div className="font-mono text-xl font-semibold">{c.value}</div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flagged results</CardTitle>
        </CardHeader>
        <CardContent>
          {flagged.length === 0 ? (
            <p className="text-sm text-muted-foreground">No flagged results. 🎉</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>WPM</TableHead>
                  <TableHead>Acc</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flagged.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.user.username ?? "—"}</TableCell>
                    <TableCell className="font-mono">{Math.round(f.wpm)}</TableCell>
                    <TableCell className="font-mono">{Math.round(f.accuracy)}%</TableCell>
                    <TableCell>{f.mode2}</TableCell>
                    <TableCell className="text-xs text-destructive">{f.flagReason}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {getRelativeTime(f.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Tests</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                      {u.role.toLowerCase()}
                    </Badge>
                    {u.banned && (
                      <Badge variant="destructive" className="ml-1">banned</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">{u._count.results}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {getRelativeTime(u.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
