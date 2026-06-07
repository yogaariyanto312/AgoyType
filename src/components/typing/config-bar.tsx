"use client";

import { AtSign, Hash, Clock, Type, Quote, Feather, FileText } from "lucide-react";
import { useConfigStore } from "@/store/config-store";
import { cn } from "@/lib/utils";
import type { TestModeKey, QuoteLength } from "@/types";

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [10, 25, 50, 100];
const QUOTE_OPTIONS: QuoteLength[] = ["short", "medium", "long", "all"];
const LANGUAGES: { id: string; label: string }[] = [
  { id: "english", label: "english" },
  { id: "indonesian", label: "indonesia" },
];

function Item({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
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
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
        active
          ? "text-tt-main"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

const MODES: { key: TestModeKey; label: string; icon: React.ElementType }[] = [
  { key: "time", label: "time", icon: Clock },
  { key: "words", label: "words", icon: Type },
  { key: "quote", label: "quote", icon: Quote },
  { key: "zen", label: "zen", icon: Feather },
  { key: "custom", label: "custom", icon: FileText },
];

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

  return (
    <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-0.5 rounded-lg bg-card px-2 py-1.5 text-card-foreground shadow-sm">
      {(mode === "time" || mode === "words") && (
        <>
          <Item active={punctuation} onClick={togglePunctuation} title="Punctuation">
            <AtSign className="h-3.5 w-3.5" /> punctuation
          </Item>
          <Item active={numbers} onClick={toggleNumbers} title="Numbers">
            <Hash className="h-3.5 w-3.5" /> numbers
          </Item>
          <Divider />
        </>
      )}

      {MODES.map((m) => {
        const Icon = m.icon;
        return (
          <Item key={m.key} active={mode === m.key} onClick={() => setMode(m.key)}>
            <Icon className="h-3.5 w-3.5" /> {m.label}
          </Item>
        );
      })}

      {(mode === "time" || mode === "words" || mode === "quote") && <Divider />}

      {mode === "time" &&
        TIME_OPTIONS.map((t) => (
          <Item key={t} active={time === t} onClick={() => setTime(t)}>
            {t}
          </Item>
        ))}
      {mode === "time" && (
        <Item active={time === 0} onClick={() => setTime(0)} title="Infinite">
          ∞
        </Item>
      )}

      {mode === "words" &&
        WORD_OPTIONS.map((w) => (
          <Item key={w} active={words === w} onClick={() => setWords(w)}>
            {w}
          </Item>
        ))}

      {mode === "quote" &&
        QUOTE_OPTIONS.map((q) => (
          <Item key={q} active={quoteLength === q} onClick={() => setQuoteLength(q)}>
            {q}
          </Item>
        ))}

      {(mode === "time" || mode === "words" || mode === "quote") && (
        <>
          <Divider />
          {LANGUAGES.map((l) => (
            <Item
              key={l.id}
              active={language === l.id}
              onClick={() => setLanguage(l.id)}
              title="Language"
            >
              {l.label}
            </Item>
          ))}
        </>
      )}
    </div>
  );
}
