import type { Metadata } from "next";
import Link from "next/link";
import {
  Zap,
  BarChart3,
  Palette,
  Trophy,
  ShieldCheck,
  Keyboard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "About" };

const features = [
  {
    icon: Zap,
    title: "Real-time engine",
    body: "Per-character validation, a smooth animated caret, and instant feedback across time, words, quote, custom, numbers, punctuation and zen modes.",
  },
  {
    icon: BarChart3,
    title: "Deep statistics",
    body: "WPM, raw WPM, accuracy, consistency and a per-second graph — computed with the same definitions used by the tools you already know.",
  },
  {
    icon: Palette,
    title: "Beautiful themes",
    body: "Eight hand-tuned themes driven by CSS variables, switchable instantly from the command palette (Ctrl+K).",
  },
  {
    icon: Trophy,
    title: "Leaderboards & PBs",
    body: "Daily, weekly, monthly and all-time rankings per category, personal bests, and unlockable achievements.",
  },
  {
    icon: ShieldCheck,
    title: "Fair play",
    body: "Every result is recomputed and validated server-side, with anti-cheat heuristics, rate limiting and input validation.",
  },
  {
    icon: Keyboard,
    title: "Made for keyboards",
    body: "Full keyboard shortcuts, Tab-to-restart, accessible focus handling and a responsive, mobile-friendly layout.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 py-6">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Agoy<span className="text-tt-main">Type</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          A modern, open typing test inspired by Monkeytype and 10FastFingers —
          built with Next.js 15, TypeScript, Prisma and Tailwind. Test your speed,
          track your progress and compete on the leaderboard.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Start typing</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/leaderboard">View leaderboard</Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title}>
              <CardHeader>
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-tt-main/10 text-tt-main">
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{f.body}</CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
