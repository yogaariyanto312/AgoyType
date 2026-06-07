"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_THEME_ID } from "@/lib/themes";
import type { TestConfig, TestModeKey, QuoteLength } from "@/types";

interface ConfigState extends TestConfig {
  themeId: string;
  smoothCaret: boolean;
  soundOnClick: boolean;
  hideLiveWpm: boolean;
  particlesBg: boolean;

  setMode: (mode: TestModeKey) => void;
  setTime: (time: number) => void;
  setWords: (words: number) => void;
  setQuoteLength: (q: QuoteLength) => void;
  setLanguage: (lang: string) => void;
  togglePunctuation: () => void;
  toggleNumbers: () => void;
  setCustomText: (text: string) => void;
  setTheme: (id: string) => void;
  setSmoothCaret: (v: boolean) => void;
  setSoundOnClick: (v: boolean) => void;
  setHideLiveWpm: (v: boolean) => void;
  setParticlesBg: (v: boolean) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      mode: "time",
      time: 30,
      words: 25,
      quoteLength: "medium",
      language: "english",
      punctuation: false,
      numbers: false,
      customText: "",

      themeId: DEFAULT_THEME_ID,
      smoothCaret: true,
      soundOnClick: false,
      hideLiveWpm: false,
      particlesBg: true,

      setMode: (mode) => set({ mode }),
      setTime: (time) => set({ time, mode: "time" }),
      setWords: (words) => set({ words, mode: "words" }),
      setQuoteLength: (quoteLength) => set({ quoteLength, mode: "quote" }),
      setLanguage: (language) => set({ language }),
      togglePunctuation: () => set((s) => ({ punctuation: !s.punctuation })),
      toggleNumbers: () => set((s) => ({ numbers: !s.numbers })),
      setCustomText: (customText) => set({ customText }),
      setTheme: (themeId) => set({ themeId }),
      setSmoothCaret: (smoothCaret) => set({ smoothCaret }),
      setSoundOnClick: (soundOnClick) => set({ soundOnClick }),
      setHideLiveWpm: (hideLiveWpm) => set({ hideLiveWpm }),
      setParticlesBg: (particlesBg) => set({ particlesBg }),
    }),
    {
      name: "agoytype-config",
      version: 1,
    },
  ),
);
