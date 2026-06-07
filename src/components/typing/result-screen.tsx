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

function StatPill({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl bg-foreground/[0.04] px-4 py-3 ring-1 ring-foreground/[0.06]">
      <span className="font-mono text-xl font-semibold tabular-nums text-tt-main">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
      {sub && (
        <span className="text-[10px] text-muted-foreground/60">{sub}</span>
      )}
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
    <div className="animate-fade-in space-y-6">
      {/* ── Header row: mode tag + PB badge ── */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-foreground/[0.06] px-3 py-1 font-mono text-sm text-muted-foreground ring-1 ring-foreground/[0.07]">
          {mode2}
          {language !== "english" && (
            <span className="ml-1.5 opacity-60">{language}</span>
          )}
        </span>
        {isPersonalBest && (
          <span className="flex items-center gap-1.5 rounded-full bg-tt-main/15 px-3 py-1 text-sm font-semibold text-tt-main ring-1 ring-tt-main/25">
            <Crown className="h-3.5 w-3.5" /> personal best
          </span>
        )}
      </div>

      {/* ── Hero metrics: WPM centered, accuracy secondary ── */}
      <div className="flex items-end justify-center gap-10 py-2">
        <div className="text-center">
          <div className="font-mono text-[5.5rem] font-bold leading-none tabular-nums text-tt-main">
            {Math.round(result.wpm)}
          </div>
          <div className="mt-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            wpm
          </div>
        </div>
        <div className="mb-3 text-center">
          <div className="font-mono text-5xl font-bold leading-none tabular-nums text-tt-main/75">
            {Math.round(result.accuracy)}
            <span className="text-3xl">%</span>
          </div>
          <div className="mt-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            accuracy
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="rounded-xl bg-foreground/[0.03] p-4 ring-1 ring-foreground/[0.06]">
        <ResultChart rawData={rawData} />
      </div>

      {/* ── Stat pills grid ── */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <StatPill label="raw" value={Math.round(result.rawWpm)} />
        <StatPill
          label="consistency"
          value={`${Math.round(result.consistency)}%`}
        />
        <StatPill
          label="chars"
          value={`${charStats.correct}/${charStats.incorrect}`}
          sub="correct / wrong"
        />
        <StatPill
          label="time"
          value={`${Math.round(result.durationSeconds)}s`}
        />
        <StatPill label="keystrokes" value={result.keystrokes} />
        <StatPill
          label="extra / missed"
          value={`${charStats.extra}/${charStats.missed}`}
        />
      </div>

      {quoteSource && (
        <p className="text-center text-sm italic text-muted-foreground/70">
          — {quoteSource}
        </p>
      )}

      {/* ── Achievement badges ── */}
      {newAchievements.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {newAchievements.map((a) => (
            <span
              key={a}
              className="flex items-center gap-1 rounded-full bg-tt-main/10 px-3 py-1 text-xs font-medium text-tt-main ring-1 ring-tt-main/20"
            >
              <Trophy className="h-3 w-3" /> {a}
            </span>
          ))}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center justify-between border-t border-foreground/[0.06] pt-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRepeat}
          title="Repeat same test"
          className="rounded-full"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div className="text-xs text-muted-foreground">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> saving…
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-tt-main/70">saved ✓</span>
          )}
          {saveStatus === "guest" && (
            <span>log in to save results</span>
          )}
          {saveStatus === "error" && (
            <span className="text-destructive">save failed</span>
          )}
        </div>

        <Button onClick={onNext} className={cn("gap-2 rounded-full")}>
          Next test <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
