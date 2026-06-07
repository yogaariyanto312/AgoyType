"use client";

import { useTypingStore } from "@/store/typing-store";
import { useConfigStore } from "@/store/config-store";

/** Compact live readout shown above the words while a test is running. */
export function LiveStats() {
  const status = useTypingStore((s) => s.status);
  const mode = useTypingStore((s) => s.mode);
  const timeLimit = useTypingStore((s) => s.timeLimit);
  const wordLimit = useTypingStore((s) => s.wordLimit);
  const wordIndex = useTypingStore((s) => s.wordIndex);
  const elapsedMs = useTypingStore((s) => s.elapsedMs);
  const liveWpm = useTypingStore((s) => s.liveWpm);
  const hideLiveWpm = useConfigStore((s) => s.hideLiveWpm);

  const running = status === "running";
  const elapsed = elapsedMs / 1000;

  let primary: string;
  if (timeLimit > 0) {
    primary = `${Math.max(0, Math.ceil(timeLimit - elapsed))}`;
  } else if (wordLimit > 0) {
    primary = `${Math.min(wordIndex, wordLimit)}/${wordLimit}`;
  } else {
    primary = `${Math.floor(elapsed)}s`;
  }

  return (
    <div className="flex h-8 items-center gap-4 font-mono text-2xl text-tt-main">
      <span className={running || mode === "zen" ? "opacity-100" : "opacity-0"}>
        {primary}
      </span>
      {!hideLiveWpm && running && (
        <span className="text-xl text-muted-foreground">{liveWpm} wpm</span>
      )}
    </div>
  );
}
