import type { TestMode } from "@prisma/client";
import type { CharStats, RawDataPoint } from "@/lib/stats";

export type { TestMode };
export type { CharStats, RawDataPoint };

/** Typing test mode tags used by the config bar / store. */
export type TestModeKey = "time" | "words" | "quote" | "custom" | "zen";

export type TimeOption = 15 | 30 | 60 | 120;
export type WordOption = 10 | 25 | 50 | 100;
export type QuoteLength = "short" | "medium" | "long" | "all";

export interface TestConfig {
  mode: TestModeKey;
  time: number; // seconds for time mode
  words: number; // word count for words mode
  quoteLength: QuoteLength;
  language: string;
  punctuation: boolean;
  numbers: boolean;
  customText: string;
}

/** Payload POSTed to /api/results. */
export interface ResultPayload {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  errors: number;
  keystrokes: number;
  mode: TestMode;
  mode2: string;
  language: string;
  duration: number;
  testText?: string;
  charStats: CharStats;
  rawData: RawDataPoint[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string | null;
  image: string | null;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  mode: TestMode;
  mode2: string;
  createdAt: string;
}
