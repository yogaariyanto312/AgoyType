"use client";

import { create } from "zustand";
import { generateWords, extendWords } from "@/lib/words";
import { pickQuote } from "@/lib/quotes";
import { buildResultStats, type ComputedStats, type RawDataPoint } from "@/lib/stats";
import type { TestConfig, TestMode } from "@/types";

type Status = "idle" | "running" | "finished";

interface InitSnapshot {
  mode: TestConfig["mode"];
  time: number;
  words: number;
  quoteLength: TestConfig["quoteLength"];
  language: string;
  punctuation: boolean;
  numbers: boolean;
  customText: string;
}

interface TypingState {
  status: Status;
  isZen: boolean;
  isInfinite: boolean;

  words: string[];
  inputs: string[]; // inputs[i] = typed text for word i; length === wordIndex + 1
  wordIndex: number;

  // limits / meta of the active test
  mode: TestConfig["mode"];
  prismaMode: TestMode;
  mode2: string;
  language: string;
  timeLimit: number; // seconds (0 = no limit)
  wordLimit: number; // words (0 = no limit)
  quoteSource: string | null;

  // timing
  startTime: number | null;
  elapsedMs: number;

  // counters (cumulative, never decremented — accuracy semantics)
  correctKeypresses: number;
  incorrectKeypresses: number;

  // telemetry
  rawData: RawDataPoint[];
  lastSampleSecond: number;
  lastSampleChars: number;

  // live display
  liveWpm: number;
  liveRaw: number;
  liveErrors: number;

  result: ComputedStats | null;
  snapshot: InitSnapshot | null;

  // actions
  init: (config: TestConfig) => void;
  reset: () => void; // new text, same config
  repeat: () => void; // same text again
  typeChar: (c: string) => void;
  handleSpace: () => void;
  handleBackspace: (ctrl: boolean) => void;
  tick: (now: number) => void;
  finish: () => void;
}

function buildTarget(config: TestConfig): {
  words: string[];
  prismaMode: TestMode;
  mode2: string;
  timeLimit: number;
  wordLimit: number;
  quoteSource: string | null;
  isZen: boolean;
  isInfinite: boolean;
} {
  const { mode, punctuation, numbers } = config;

  if (mode === "zen") {
    return {
      words: [],
      prismaMode: "ZEN",
      mode2: "zen",
      timeLimit: 0,
      wordLimit: 0,
      quoteSource: null,
      isZen: true,
      isInfinite: true,
    };
  }

  if (mode === "quote") {
    const q = pickQuote(
      config.quoteLength === "all" ? undefined : config.quoteLength,
      config.language,
    );
    return {
      words: q.text.split(/\s+/),
      prismaMode: "QUOTE",
      mode2: `quote:${config.quoteLength}`,
      timeLimit: 0,
      wordLimit: q.text.split(/\s+/).length,
      quoteSource: q.source,
      isZen: false,
      isInfinite: false,
    };
  }

  if (mode === "custom") {
    const text = config.customText.trim() || "the quick brown fox jumps over the lazy dog";
    const words = text.split(/\s+/);
    return {
      words,
      prismaMode: "CUSTOM",
      mode2: "custom",
      timeLimit: 0,
      wordLimit: words.length,
      quoteSource: null,
      isZen: false,
      isInfinite: false,
    };
  }

  if (mode === "time") {
    const infinite = config.time === 0;
    // generate a generous buffer; time mode extends as needed
    const initial = infinite ? 80 : Math.max(40, Math.ceil(config.time * 3));
    return {
      words: generateWords({
        wordCount: initial,
        punctuation,
        numbers,
        extended: true,
        language: config.language,
      }),
      prismaMode: "TIME",
      mode2: infinite ? "time:infinite" : `time:${config.time}`,
      timeLimit: config.time,
      wordLimit: 0,
      quoteSource: null,
      isZen: false,
      isInfinite: infinite,
    };
  }

  // words mode
  const infinite = config.words === 0;
  const count = infinite ? 80 : config.words;
  return {
    words: generateWords({
      wordCount: count,
      punctuation,
      numbers,
      extended: true,
      language: config.language,
    }),
    prismaMode: "WORDS",
    mode2: infinite ? "words:infinite" : `words:${config.words}`,
    timeLimit: 0,
    wordLimit: infinite ? 0 : config.words,
    quoteSource: null,
    isZen: false,
    isInfinite: infinite,
  };
}

const FRESH = {
  status: "idle" as Status,
  inputs: [""],
  wordIndex: 0,
  startTime: null,
  elapsedMs: 0,
  correctKeypresses: 0,
  incorrectKeypresses: 0,
  rawData: [] as RawDataPoint[],
  lastSampleSecond: 0,
  lastSampleChars: 0,
  liveWpm: 0,
  liveRaw: 0,
  liveErrors: 0,
  result: null,
};

export const useTypingStore = create<TypingState>((set, get) => ({
  ...FRESH,
  isZen: false,
  isInfinite: false,
  words: [],
  mode: "time",
  prismaMode: "TIME",
  mode2: "time:30",
  language: "english",
  timeLimit: 30,
  wordLimit: 0,
  quoteSource: null,
  snapshot: null,

  init: (config) => {
    const built = buildTarget(config);
    set({
      ...FRESH,
      inputs: [""],
      words: built.words,
      mode: config.mode,
      prismaMode: built.prismaMode,
      mode2: built.mode2,
      language: config.language,
      timeLimit: built.timeLimit,
      wordLimit: built.wordLimit,
      quoteSource: built.quoteSource,
      isZen: built.isZen,
      isInfinite: built.isInfinite,
      snapshot: {
        mode: config.mode,
        time: config.time,
        words: config.words,
        quoteLength: config.quoteLength,
        language: config.language,
        punctuation: config.punctuation,
        numbers: config.numbers,
        customText: config.customText,
      },
    });
  },

  reset: () => {
    const snap = get().snapshot;
    if (snap) get().init(snap as TestConfig);
    else set({ ...FRESH, inputs: [""] });
  },

  repeat: () => {
    const { words } = get();
    set({ ...FRESH, inputs: [""], words: [...words] });
  },

  typeChar: (c) => {
    const state = get();
    if (state.status === "finished") return;

    // auto-start on first keystroke
    let patch: Partial<TypingState> = {};
    if (state.status === "idle") {
      patch = { status: "running", startTime: performance.now() };
    }

    const inputs = [...state.inputs];
    const wi = state.wordIndex;
    const current = inputs[wi] ?? "";
    const target = state.words[wi] ?? "";
    const pos = current.length;

    let correct = state.correctKeypresses;
    let incorrect = state.incorrectKeypresses;

    if (state.isZen) {
      correct += 1; // everything is "correct" in zen
    } else if (pos < target.length && c === target[pos]) {
      correct += 1;
    } else {
      incorrect += 1; // wrong char or extra char beyond word length
    }

    inputs[wi] = current + c;

    // keep a buffer of words ahead for infinite/time modes
    let words = state.words;
    if ((state.isInfinite || state.timeLimit > 0) && wi > words.length - 15) {
      words = extendWords(words, 40, {
        punctuation: state.snapshot?.punctuation ?? false,
        numbers: state.snapshot?.numbers ?? false,
        extended: true,
        language: state.language,
      });
    }

    set({
      ...patch,
      inputs,
      words,
      correctKeypresses: correct,
      incorrectKeypresses: incorrect,
    });

    // words/quote/custom mode: auto-finish when the final word is fully typed
    const limit = state.wordLimit;
    if (
      limit > 0 &&
      wi === limit - 1 &&
      inputs[wi].length >= (state.words[wi]?.length ?? 0)
    ) {
      get().finish();
    }
  },

  handleSpace: () => {
    const state = get();
    if (state.status === "finished") return;
    const wi = state.wordIndex;
    const current = state.inputs[wi] ?? "";
    if (current.length === 0) return; // ignore leading / double spaces

    const inputs = [...state.inputs, ""];
    const nextIndex = wi + 1;

    set({
      inputs,
      wordIndex: nextIndex,
      correctKeypresses: state.correctKeypresses + 1, // the separating space
    });

    // words/quote/custom: finished once we advance past the last word
    if (state.wordLimit > 0 && nextIndex >= state.wordLimit) {
      get().finish();
    }
  },

  handleBackspace: (ctrl) => {
    const state = get();
    if (state.status !== "running") return;
    const inputs = [...state.inputs];
    const wi = state.wordIndex;
    const current = inputs[wi] ?? "";

    if (ctrl) {
      inputs[wi] = "";
      set({ inputs });
      return;
    }

    if (current.length > 0) {
      inputs[wi] = current.slice(0, -1);
      set({ inputs });
    } else if (wi > 0) {
      // step back into the previous word to fix it
      inputs.pop();
      set({ inputs, wordIndex: wi - 1 });
    }
  },

  tick: (now) => {
    const state = get();
    if (state.status !== "running" || state.startTime === null) return;

    const elapsedMs = now - state.startTime;
    const elapsedSec = elapsedMs / 1000;
    const second = Math.floor(elapsedSec);

    const patch: Partial<TypingState> = { elapsedMs };

    if (second > state.lastSampleSecond) {
      const totalChars = state.correctKeypresses + state.incorrectKeypresses;
      const deltaChars = totalChars - state.lastSampleChars;
      const seconds = second - state.lastSampleSecond;
      const instantRaw = seconds > 0 ? (deltaChars / 5) * (60 / seconds) : 0;

      // cumulative net wpm for the headline live number
      const cumulativeWpm =
        elapsedSec > 0 ? (state.correctKeypresses / 5) / (elapsedSec / 60) : 0;

      const sample: RawDataPoint = {
        t: second,
        wpm: Math.round(cumulativeWpm * 100) / 100,
        raw: Math.round(Math.max(0, instantRaw) * 100) / 100,
        errors: state.incorrectKeypresses,
      };

      patch.rawData = [...state.rawData, sample];
      patch.lastSampleSecond = second;
      patch.lastSampleChars = totalChars;
      patch.liveWpm = Math.round(cumulativeWpm);
      patch.liveRaw = Math.round(Math.max(0, instantRaw));
      patch.liveErrors = state.incorrectKeypresses;
    }

    set(patch);

    if (state.timeLimit > 0 && elapsedSec >= state.timeLimit) {
      get().finish();
    }
  },

  finish: () => {
    const state = get();
    if (state.status === "finished") return;

    const durationSeconds =
      state.timeLimit > 0
        ? state.timeLimit
        : state.startTime !== null
          ? (performance.now() - state.startTime) / 1000
          : state.elapsedMs / 1000;

    // trim trailing empty current word so spaces aren't over-credited
    const typedPerWord = [...state.inputs];
    while (typedPerWord.length > 1 && typedPerWord[typedPerWord.length - 1] === "") {
      typedPerWord.pop();
    }

    const targets = state.isZen ? typedPerWord : state.words;

    const result = buildResultStats({
      targets,
      typedPerWord,
      keypresses: {
        correct: state.correctKeypresses,
        incorrect: state.incorrectKeypresses,
      },
      rawData: state.rawData,
      durationSeconds: Math.max(0.5, durationSeconds),
    });

    set({ status: "finished", result, elapsedMs: durationSeconds * 1000 });
  },
}));
