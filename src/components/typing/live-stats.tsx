"use client";

import { useTypingStore } from "@/store/typing-store";
import { useConfigStore } from "@/store/config-store";
import { cn } from "@/lib/utils";

/** Live readout shown above the typing card during a test. */
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

  const visible = running || mode === "zen";

  return (
    <div className="flex items-center gap-2">
      {/* Primary counter — pill badge */}
      <div
        className={cn(
          "rounded-full bg-tt-main/10 px-3 py-1 font-mono text-xl font-bold tabular-nums text-tt-main ring-1 ring-tt-main/20 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        {primary}
      </div>

      {/* Live WPM — secondary pill */}
      {!hideLiveWpm && running && (
        <div className="rounded-full bg-foreground/[0.06] px-2.5 py-1 font-mono text-sm tabular-nums text-muted-foreground ring-1 ring-foreground/[0.08]">
          {liveWpm} wpm
        </div>
      )}
    </div>
  );
}
