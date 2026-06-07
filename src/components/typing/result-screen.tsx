"use client";

import { RotateCcw, ArrowRight, Crown, Loader2, Trophy } from "lucide-react";
import { useTypingStore } from "@/store/typing-store";
import { ResultChart } from "@/components/charts/result-chart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResultScreenProps {
  onNext: () => void;
  onRepeat: () => void;
  saveStatus: "idle" | "saving" | "saved" | "error" | "guest";
  isPersonalBest: boolean;
  newAchievements: string[];
}

function Stat({
  label,
  value,
  sub,
  big,
}: {
  label: string;
  value: string | number;
  sub?: string;
  big?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono font-semibold leading-none text-tt-main",
          big ? "text-6xl" : "text-3xl",
        )}
      >
        {value}
      </span>
      {sub && <span className="mt-1 text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

export function ResultScreen({
  onNext,
  onRepeat,
  saveStatus,
  isPersonalBest,
  newAchievements,
}: ResultScreenProps) {
  const result = useTypingStore((s) => s.result);
  const rawData = useTypingStore((s) => s.rawData);
  const mode2 = useTypingStore((s) => s.mode2);
  const language = useTypingStore((s) => s.language);
  const quoteSource = useTypingStore((s) => s.quoteSource);

  if (!result) return null;
  const { charStats } = result;

  return (
    <div className="mx-auto w-full max-w-4xl animate-fade-in">
      {isPersonalBest && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-tt-main/10 py-2 text-tt-main">
          <Crown className="h-5 w-5" />
          <span className="font-semibold">New personal best!</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
        <div className="flex flex-row justify-around md:flex-col md:justify-start md:gap-6">
          <Stat label="wpm" value={Math.round(result.wpm)} big />
          <Stat label="accuracy" value={`${Math.round(result.accuracy)}%`} big />
        </div>

        <div className="flex flex-col justify-center">
          <ResultChart rawData={rawData} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:grid-cols-6">
        <Stat label="test type" value={mode2} sub={language} />
        <Stat label="raw" value={Math.round(result.rawWpm)} />
        <Stat label="consistency" value={`${Math.round(result.consistency)}%`} />
        <Stat
          label="characters"
          value={`${charStats.correct}/${charStats.incorrect}/${charStats.extra}/${charStats.missed}`}
          sub="correct/incorrect/extra/missed"
        />
        <Stat label="time" value={`${Math.round(result.durationSeconds)}s`} />
        <Stat label="keystrokes" value={result.keystrokes} />
      </div>

      {quoteSource && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          — {quoteSource}
        </p>
      )}

      {newAchievements.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {newAchievements.map((a) => (
            <span
              key={a}
              className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs"
            >
              <Trophy className="h-3 w-3 text-tt-main" /> {a}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-3">
        <Button variant="ghost" size="icon" onClick={onRepeat} title="Repeat test">
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button onClick={onNext} className="gap-2">
          Next test <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="ml-2 text-xs text-muted-foreground">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> saving…
            </span>
          )}
          {saveStatus === "saved" && <span>saved ✓</span>}
          {saveStatus === "guest" && <span>log in to save results</span>}
          {saveStatus === "error" && (
            <span className="text-destructive">save failed</span>
          )}
        </div>
      </div>
    </div>
  );
}
