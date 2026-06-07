"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { RotateCcw, Lock } from "lucide-react";
import { toast } from "sonner";
import { useTypingStore } from "@/store/typing-store";
import { useConfigStore } from "@/store/config-store";
import { ConfigBar } from "./config-bar";
import { TypingWords } from "./typing-words";
import { LiveStats } from "./live-stats";
import { ResultScreen } from "./result-screen";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComputedStats } from "@/lib/stats";
import type { ResultPayload } from "@/types";

type SaveStatus = "idle" | "saving" | "saved" | "error" | "guest";

export function TypingTest() {
  const { status: sessionStatus } = useSession();

  // engine state
  const status = useTypingStore((s) => s.status);
  const words = useTypingStore((s) => s.words);
  const inputs = useTypingStore((s) => s.inputs);
  const wordIndex = useTypingStore((s) => s.wordIndex);
  const isZen = useTypingStore((s) => s.isZen);
  const init = useTypingStore((s) => s.init);
  const reset = useTypingStore((s) => s.reset);
  const repeat = useTypingStore((s) => s.repeat);
  const typeChar = useTypingStore((s) => s.typeChar);
  const handleSpace = useTypingStore((s) => s.handleSpace);
  const handleBackspace = useTypingStore((s) => s.handleBackspace);
  const tick = useTypingStore((s) => s.tick);
  const finish = useTypingStore((s) => s.finish);

  // config (primitive fields drive re-init)
  const mode = useConfigStore((s) => s.mode);
  const time = useConfigStore((s) => s.time);
  const wordCount = useConfigStore((s) => s.words);
  const quoteLength = useConfigStore((s) => s.quoteLength);
  const language = useConfigStore((s) => s.language);
  const punctuation = useConfigStore((s) => s.punctuation);
  const numbers = useConfigStore((s) => s.numbers);
  const customText = useConfigStore((s) => s.customText);
  const smoothCaret = useConfigStore((s) => s.smoothCaret);

  const [focused, setFocused] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isPersonalBest, setIsPersonalBest] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastSavedRef = useRef<ComputedStats | null>(null);

  const buildConfig = useCallback(
    () => ({
      mode,
      time,
      words: wordCount,
      quoteLength,
      language,
      punctuation,
      numbers,
      customText,
    }),
    [mode, time, wordCount, quoteLength, language, punctuation, numbers, customText],
  );

  // (re)initialise whenever the configuration changes
  useEffect(() => {
    init(buildConfig());
    setSaveStatus("idle");
    setIsPersonalBest(false);
    setNewAchievements([]);
    lastSavedRef.current = null;
  }, [buildConfig, init]);

  const focusTest = useCallback(() => {
    containerRef.current?.focus();
  }, []);

  const restart = useCallback(() => {
    reset();
    setSaveStatus("idle");
    setIsPersonalBest(false);
    setNewAchievements([]);
    lastSavedRef.current = null;
    requestAnimationFrame(focusTest);
  }, [reset, focusTest]);

  const repeatTest = useCallback(() => {
    repeat();
    setSaveStatus("idle");
    setIsPersonalBest(false);
    setNewAchievements([]);
    lastSavedRef.current = null;
    requestAnimationFrame(focusTest);
  }, [repeat, focusTest]);

  // sampling / timing loop
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => tick(performance.now()), 100);
    return () => clearInterval(id);
  }, [status, tick]);

  // focus the test area on mount
  useEffect(() => {
    focusTest();
  }, [focusTest]);

  // pressing any key while unfocused brings focus back to the test area
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      if (document.activeElement !== containerRef.current && status !== "finished") {
        focusTest();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focusTest, status]);

  // keyboard handling
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const { key, ctrlKey, metaKey, altKey } = e;

      if (key === "Tab") {
        e.preventDefault();
        restart();
        return;
      }

      if (status === "finished") {
        if (key === "Enter") {
          e.preventDefault();
          restart();
        }
        return;
      }

      // ignore shortcut combos (except ctrl/alt+backspace handled below)
      if (metaKey) return;

      if (key === "Backspace") {
        e.preventDefault();
        handleBackspace(ctrlKey || altKey);
        return;
      }

      if (ctrlKey || altKey) return;

      if (key === " ") {
        e.preventDefault();
        if (isZen) typeChar(" ");
        else handleSpace();
        return;
      }

      if (key === "Enter" && isZen) {
        e.preventDefault();
        finish();
        return;
      }

      // a single printable character
      if (key.length === 1) {
        e.preventDefault();
        typeChar(key);
      }
    },
    [status, isZen, restart, handleBackspace, handleSpace, typeChar, finish],
  );

  // persist the result once the test finishes
  const result = useTypingStore((s) => s.result);
  const rawData = useTypingStore((s) => s.rawData);
  const mode2 = useTypingStore((s) => s.mode2);
  const prismaMode = useTypingStore((s) => s.prismaMode);
  const engineLanguage = useTypingStore((s) => s.language);

  useEffect(() => {
    if (status !== "finished" || !result) return;
    if (lastSavedRef.current === result) return;
    lastSavedRef.current = result;

    if (sessionStatus !== "authenticated") {
      setSaveStatus("guest");
      return;
    }

    const testText = (isZen ? inputs.join(" ") : words.slice(0, wordIndex + 1).join(" ")).slice(0, 5000);
    const payload: ResultPayload = {
      wpm: result.wpm,
      rawWpm: result.rawWpm,
      accuracy: result.accuracy,
      consistency: result.consistency,
      errors: result.errors,
      keystrokes: result.keystrokes,
      mode: prismaMode,
      mode2,
      language: engineLanguage,
      duration: result.durationSeconds,
      testText,
      charStats: result.charStats,
      rawData,
    };

    setSaveStatus("saving");
    fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: { isPersonalBest?: boolean; newAchievements?: string[]; flagged?: boolean }) => {
        setSaveStatus("saved");
        if (data.flagged) {
          toast.warning("Result flagged by anti-cheat and excluded from records.");
        }
        if (data.isPersonalBest) {
          setIsPersonalBest(true);
          toast.success("New personal best! 🎉");
        }
        if (data.newAchievements && data.newAchievements.length > 0) {
          setNewAchievements(data.newAchievements);
          toast.success(`Unlocked ${data.newAchievements.length} achievement(s)!`);
        }
      })
      .catch(() => setSaveStatus("error"));
  }, [status, result, rawData, sessionStatus, isZen, inputs, words, wordIndex, prismaMode, mode2, engineLanguage]);

  const showConfigBar = status === "idle";
  const blinkCaret = status !== "running";

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {status === "finished" ? (
        /* ── result card ─────────────────────────────────────────── */
        <div className="w-full max-w-4xl">
          <div className="liquid-glass px-8 py-8">
            <ResultScreen
              onNext={restart}
              onRepeat={repeatTest}
              saveStatus={saveStatus}
              isPersonalBest={isPersonalBest}
              newAchievements={newAchievements}
            />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-5xl space-y-3">
          {/* live stats row — sits above the card */}
          <div className="flex min-h-7 items-center justify-between px-1">
            <LiveStats />
            {isZen && status === "running" && (
              <Button size="sm" variant="secondary" onClick={finish}>
                finish (enter)
              </Button>
            )}
          </div>

          {/* ── liquid glass card ────────────────────────────────── */}
          <div className="liquid-glass">
            {/* config bar — collapses smoothly when the test starts */}
            <div
              className={cn(
                "relative z-[1] overflow-hidden transition-all duration-300 ease-in-out",
                showConfigBar
                  ? "max-h-40 border-b border-foreground/[0.07] opacity-100"
                  : "pointer-events-none max-h-0 opacity-0",
              )}
            >
              <div className="px-6 pt-2 pb-3">
                <ConfigBar />
              </div>
            </div>

            {/* typing area */}
            <div
              ref={containerRef}
              tabIndex={0}
              role="textbox"
              aria-label="Typing test input area"
              onKeyDown={onKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onClick={focusTest}
              className="relative z-[1] cursor-text px-8 py-8 outline-none"
            >
              <div
                className={cn(
                  "transition-[filter] duration-200",
                  !focused && "pointer-events-none blur-[5px]",
                )}
              >
                <TypingWords
                  words={words}
                  inputs={inputs}
                  wordIndex={wordIndex}
                  isZen={isZen}
                  smoothCaret={smoothCaret}
                  blink={blinkCaret}
                />
              </div>

              {!focused && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" /> click or press any key to focus
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* ── end liquid glass card ────────────────────────────── */}

          {/* restart hint */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <button
              onClick={restart}
              className="flex items-center gap-1.5 hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" /> restart
            </button>
            <span className="rounded bg-secondary px-1.5 py-0.5 font-mono">tab</span>
            <span>— restart test</span>
          </div>
        </div>
      )}
    </div>
  );
}
