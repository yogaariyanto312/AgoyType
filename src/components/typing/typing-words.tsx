"use client";

import { memo, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TypingWordsProps {
  words: string[];
  inputs: string[];
  wordIndex: number;
  isZen: boolean;
  smoothCaret: boolean;
  blink: boolean; // blink when idle / paused
}

interface CaretPos {
  left: number;
  top: number;
  height: number;
}

/**
 * Renders the target words with per-character correct/incorrect/extra coloring
 * and a single absolutely-positioned caret that animates between letters.
 */
function TypingWordsBase({
  words,
  inputs,
  wordIndex,
  isZen,
  smoothCaret,
  blink,
}: TypingWordsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLDivElement>(null);
  const activeLetterRef = useRef<HTMLSpanElement>(null);
  const afterLetterRef = useRef<HTMLSpanElement>(null);

  const [caret, setCaret] = useState<CaretPos>({ left: 0, top: 0, height: 0 });
  const [scrollY, setScrollY] = useState(0);

  // Window the rendered words so very long / infinite tests stay performant.
  const windowStart = Math.max(0, wordIndex - 80);
  const windowEnd = Math.min(words.length, wordIndex + 120);
  const visible = words.slice(windowStart, windowEnd);

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    // caret sits before the active letter, or at the right edge of the last one
    const letterEl = activeLetterRef.current ?? afterLetterRef.current;
    const wordEl = activeWordRef.current;
    if (!letterEl || !wordEl) return;

    const lRect = letterEl.getBoundingClientRect();

    // keep the active line as the (at most) second visible line
    const lineHeight = wordEl.offsetHeight || lRect.height;
    const desired = Math.max(0, wordEl.offsetTop - lineHeight);

    // Position the caret in the inner content's own coordinate space (which is
    // transform-independent) and subtract the *new* scroll offset. Computing
    // both from the same layout pass keeps the caret locked to the text even on
    // the frame where the active line advances (previously it lagged by a line).
    const innerRect = inner.getBoundingClientRect();
    const atEnd = !activeLetterRef.current;
    const left = (atEnd ? lRect.right : lRect.left) - innerRect.left;
    const top = lRect.top - innerRect.top - desired;

    setCaret({ left, top, height: lRect.height });
    setScrollY(desired);
  }, [words, inputs, wordIndex]);

  return (
    <div
      ref={containerRef}
      className="tt-words relative w-full select-none font-mono text-2xl leading-[2.2] sm:text-3xl"
      aria-hidden="true"
    >
      <div
        className={cn("tt-caret", blink && "tt-caret--blink")}
        style={{
          left: caret.left,
          top: caret.top + (caret.height ? caret.height * 0.1 : 0),
          height: caret.height ? caret.height * 0.8 : undefined,
          transition: smoothCaret ? undefined : "none",
        }}
      />

      <div
        ref={innerRef}
        className="flex flex-wrap gap-x-[0.6em] gap-y-2 transition-transform duration-150"
        style={{ transform: `translateY(${-scrollY}px)` }}
      >
        {visible.map((word, vi) => {
          const gi = windowStart + vi; // global word index
          const typed = inputs[gi] ?? "";
          const isActive = gi === wordIndex;
          const isPast = !isActive && gi < wordIndex;
          const target = isZen ? typed : word;
          // Cap how many overflow characters render so a burst of wrong
          // keypresses on one word can't blow out the layout.
          const maxLen = isZen ? typed.length : word.length + 12;
          const len = Math.min(Math.max(target.length, typed.length), maxLen);
          const caretLetter = typed.length;

          // A word is "wrong" when any typed character is a mistake
          // (substitution or overflow), or a finished word was left unfinished.
          // Applied live on the active word and kept on completed words.
          const wrongWord =
            !isZen &&
            (isActive || isPast) &&
            ([...typed].some((ch, i) => ch !== word[i]) ||
              (isPast && typed.length < word.length));

          return (
            <div
              key={gi}
              ref={isActive ? activeWordRef : undefined}
              className={cn(
                "flex items-center border-b-2 border-transparent transition-colors duration-150",
                wrongWord && "border-tt-error/70",
              )}
            >
              {Array.from({ length: len }).map((_, i) => {
                const targetChar = target[i];
                const typedChar = typed[i];
                const isExtra = !isZen && i >= word.length;
                const isWrong =
                  !isZen &&
                  !isExtra &&
                  typedChar !== undefined &&
                  typedChar !== targetChar;

                // Top row = the EXPECTED letter (so you always see the correct
                // one). The actual key pressed is shown beneath when it's wrong.
                let topChar = targetChar ?? "";
                let cls = "text-tt-sub";
                if (typedChar !== undefined) {
                  if (isZen) {
                    topChar = typedChar;
                    cls = "text-tt-text";
                  } else if (isExtra) {
                    topChar = typedChar;
                    cls = "text-tt-error-extra";
                  } else if (isWrong) {
                    topChar = targetChar ?? "";
                    cls = "text-tt-error";
                  } else {
                    topChar = targetChar ?? "";
                    cls = "text-tt-text";
                  }
                }

                const isCaretHere = isActive && i === caretLetter;
                return (
                  <span
                    key={i}
                    ref={isCaretHere ? activeLetterRef : undefined}
                    className={cn(
                      "relative",
                      cls,
                      "transition-colors duration-100",
                      // gentle pop as each character is typed (respects the
                      // smooth-caret preference and prefers-reduced-motion)
                      smoothCaret && typedChar !== undefined && "tt-letter-pop",
                    )}
                  >
                    {isWrong ? (
                      // glyph-sized box anchors the "typed key" ghost directly
                      // beneath the correct letter (not relative to the tall line)
                      <span className="relative inline-block leading-none">
                        {topChar}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-1/2 top-[92%] -translate-x-1/2 text-[0.5em] leading-none text-tt-error/70"
                        >
                          {typedChar}
                        </span>
                      </span>
                    ) : (
                      topChar
                    )}
                  </span>
                );
              })}
              {/* anchor for the caret when it sits after the final letter */}
              {isActive && caretLetter >= len && (
                <span ref={afterLetterRef} className="inline-block w-0">
                  &#8203;
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const TypingWords = memo(TypingWordsBase);
