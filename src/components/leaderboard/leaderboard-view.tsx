"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Crown, Loader2, Medal } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRelativeTime, cn } from "@/lib/utils";
import type { LeaderboardEntry, TestMode } from "@/types";

const CATEGORIES: { label: string; mode: TestMode; mode2: string }[] = [
  { label: "Time 15s", mode: "TIME", mode2: "time:15" },
  { label: "Time 30s", mode: "TIME", mode2: "time:30" },
  { label: "Time 60s", mode: "TIME", mode2: "time:60" },
  { label: "Time 120s", mode: "TIME", mode2: "time:120" },
  { label: "Words 25", mode: "WORDS", mode2: "words:25" },
  { label: "Words 50", mode: "WORDS", mode2: "words:50" },
];

const PERIODS = ["daily", "weekly", "monthly", "alltime"] as const;

interface Props {
  initialEntries: LeaderboardEntry[];
  initialPeriod: (typeof PERIODS)[number];
  initialCategory: string; // mode2
}

function rankBadge(rank: number) {
  if (rank === 1) return <Crown className="h-4 w-4 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-zinc-300" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />;
  return <span className="text-muted-foreground">{rank}</span>;
}

export function LeaderboardView({
  initialEntries,
  initialPeriod,
  initialCategory,
}: Props) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(initialPeriod);
  const [category, setCategory] = useState(initialCategory);
  const [entries, setEntries] = useState(initialEntries);
  const [loading, setLoading] = useState(false);
  const [firstRender, setFirstRender] = useState(true);

  const load = useCallback(async () => {
    const cat = CATEGORIES.find((c) => c.mode2 === category) ?? CATEGORIES[2];
    setLoading(true);
    try {
      const res = await fetch(
        `/api/leaderboard?period=${period}&mode=${cat.mode}&mode2=${encodeURIComponent(cat.mode2)}&limit=100`,
      );
      const data = await res.json();
      setEntries(data.entries ?? []);
    } finally {
      setLoading(false);
    }
  }, [period, category]);

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }
    void load();
  }, [period, category, load, firstRender]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList>
            {PERIODS.map((p) => (
              <TabsTrigger key={p} value={p} className="capitalize">
                {p === "alltime" ? "all time" : p}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.mode2} value={c.mode2}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">WPM</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Raw</TableHead>
              <TableHead className="text-right">Acc</TableHead>
              <TableHead className="hidden text-right md:table-cell">Consistency</TableHead>
              <TableHead className="hidden text-right md:table-cell">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No results yet for this category. Be the first!
                </TableCell>
              </TableRow>
            ) : (
              entries.map((e) => (
                <TableRow key={e.userId}>
                  <TableCell className="font-medium">{rankBadge(e.rank)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/profile/${e.username}`}
                      className="flex items-center gap-2 hover:text-tt-main"
                    >
                      <Avatar className="h-7 w-7">
                        {e.image && <AvatarImage src={e.image} alt="" />}
                        <AvatarFallback className="text-xs">
                          {(e.username ?? "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{e.username ?? "anonymous"}</span>
                    </Link>
                  </TableCell>
                  <TableCell className={cn("text-right font-mono font-semibold", e.rank <= 3 && "text-tt-main")}>
                    {Math.round(e.wpm)}
                  </TableCell>
                  <TableCell className="hidden text-right font-mono text-muted-foreground sm:table-cell">
                    {Math.round(e.rawWpm)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {Math.round(e.accuracy)}%
                  </TableCell>
                  <TableCell className="hidden text-right font-mono text-muted-foreground md:table-cell">
                    {Math.round(e.consistency)}%
                  </TableCell>
                  <TableCell className="hidden text-right text-xs text-muted-foreground md:table-cell">
                    {getRelativeTime(e.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
