"use client";

import { AtSign, Hash, Clock, Type, Quote, Feather, FileText } from "lucide-react";
import { useConfigStore } from "@/store/config-store";
import { cn } from "@/lib/utils";
import type { TestModeKey, QuoteLength } from "@/types";

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [10, 25, 50, 100];
const QUOTE_OPTIONS: QuoteLength[] = ["short", "medium", "long", "all"];
const LANGUAGES: { id: string; label: string }[] = [
  { id: "english", label: "EN" },
  { id: "indonesian", label: "ID" },
];

const MODES: { key: TestModeKey; label: string; icon: React.ElementType }[] = [
  { key: "time", label: "time", icon: Clock },
  { key: "words", label: "words", icon: Type },
  { key: "quote", label: "quote", icon: Quote },
  { key: "zen", label: "zen", icon: Feather },
  { key: "custom", label: "custom", icon: FileText },
];

/** Underline-style tab for mode selection */
function ModeTab({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors duration-150",
        active ? "text-tt-main" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      {/* animated underline indicator */}
      <span
        className={cn(
          "absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-tt-main transition-all duration-200",
          active ? "w-4/5" : "w-0",
        )}
      />
    </button>
  );
}

/** Filled chip for sub-option values (numbers, quote length) */
function Chip({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded-md px-2.5 py-1 font-mono text-sm font-medium transition-all duration-150",
        active
          ? "bg-tt-main/[0.12] text-tt-main"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/** Small toggle chip for punctuation, numbers, language */
function Toggle({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-150",
        active
          ? "bg-tt-main/[0.12] text-tt-main"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function ConfigBar() {
  const {
    mode,
    time,
    words,
    quoteLength,
    punctuation,
    numbers,
    language,
    setMode,
    setTime,
    setWords,
    setQuoteLength,
    togglePunctuation,
    toggleNumbers,
    setLanguage,
  } = useConfigStore();

  const hasSubOptions =
    mode === "time" || mode === "words" || mode === "quote";
  const hasModifiers = mode === "time" || mode === "words";

  return (
    <div className="select-none">
      {/* ── Row 1: mode tabs + modifier toggles ── */}
      <div className="flex items-end justify-between">
        <div className="flex items-end">
          {MODES.map((m) => (
            <ModeTab
              key={m.key}
              active={mode === m.key}
              onClick={() => setMode(m.key)}
              label={m.label}
              icon={m.icon}
            />
          ))}
        </div>

        {hasModifiers && (
          <div className="flex items-center gap-0.5 pb-1">
            <Toggle
              active={punctuation}
              onClick={togglePunctuation}
              title="Punctuation"
            >
              <AtSign className="h-3 w-3" /> punct
            </Toggle>
            <Toggle
              active={numbers}
              onClick={toggleNumbers}
              title="Numbers"
            >
              <Hash className="h-3 w-3" /> nums
            </Toggle>
          </div>
        )}
      </div>

      {/* ── Row 2: sub-options + language (only for time/words/quote) ── */}
      {hasSubOptions && (
        <div className="flex items-center justify-between border-t border-foreground/[0.05] pt-1.5">
          <div className="flex items-center gap-0.5">
            {mode === "time" && (
              <>
                {TIME_OPTIONS.map((t) => (
                  <Chip
                    key={t}
                    active={time === t}
                    onClick={() => setTime(t)}
                  >
                    {t}
                  </Chip>
                ))}
                <Chip
                  active={time === 0}
                  onClick={() => setTime(0)}
                  title="Infinite"
                >
                  ∞
                </Chip>
              </>
            )}
            {mode === "words" &&
              WORD_OPTIONS.map((w) => (
                <Chip
                  key={w}
                  active={words === w}
                  onClick={() => setWords(w)}
                >
                  {w}
                </Chip>
              ))}
            {mode === "quote" &&
              QUOTE_OPTIONS.map((q) => (
                <Chip
                  key={q}
                  active={quoteLength === q}
                  onClick={() => setQuoteLength(q)}
                >
                  {q}
                </Chip>
              ))}
          </div>

          {/* Language selector — right-aligned */}
          <div className="flex items-center gap-0.5">
            {LANGUAGES.map((l) => (
              <Toggle
                key={l.id}
                active={language === l.id}
                onClick={() => setLanguage(l.id)}
                title={l.id}
              >
                {l.label}
              </Toggle>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
