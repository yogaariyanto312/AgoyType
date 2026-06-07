/**
 * Statistics engine.
 *
 * Definitions follow the conventions used by Monkeytype / 10FastFingers so that
 * results are comparable to other tools:
 *   - a "word" is 5 characters
 *   - WPM      = (correctChars / 5) / minutes
 *   - rawWPM   = (allTypedChars / 5) / minutes
 *   - accuracy = correctKeypresses / totalKeypresses        (keypress based;
 *                a corrected error still counts against accuracy)
 *   - consistency = 100 * (1 - cv(rawWpmPerSecond))         (steadiness of pace)
 */

export interface CharStats {
  /** Characters typed correctly at their position (incl. correct spaces). */
  correct: number;
  /** Characters typed but wrong (within a word). */
  incorrect: number;
  /** Characters typed beyond the length of the target word. */
  extra: number;
  /** Target characters never typed because the word was submitted short. */
  missed: number;
}

export interface RawDataPoint {
  /** Second since test start (1-based). */
  t: number;
  /** Net WPM at this second. */
  wpm: number;
  /** Raw WPM at this second. */
  raw: number;
  /** Cumulative errors up to this second. */
  errors: number;
}

export interface KeypressCounters {
  /** Every character-producing keypress that matched the target. */
  correct: number;
  /** Every wrong character-producing keypress (incl. ones later corrected). */
  incorrect: number;
}

export interface ComputedStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  charStats: CharStats;
  keypresses: KeypressCounters;
  /** Distinct mistakes counted for the headline "errors" figure. */
  errors: number;
  /** Total character keypresses (correct + incorrect). */
  keystrokes: number;
  durationSeconds: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Compare the user's per-word input against the target words and tally the
 * final character breakdown. `targets` and `typedPerWord` are aligned by index;
 * only words the user has reached are present in `typedPerWord`.
 */
export function computeCharStats(
  targets: readonly string[],
  typedPerWord: readonly string[],
): CharStats {
  let correct = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;

  const wordsReached = typedPerWord.length;

  for (let w = 0; w < wordsReached; w++) {
    const target = targets[w] ?? "";
    const typed = typedPerWord[w] ?? "";

    for (let i = 0; i < typed.length; i++) {
      if (i >= target.length) {
        extra++;
      } else if (typed[i] === target[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }
    // characters of the target the user never typed in this word
    if (typed.length < target.length) {
      missed += target.length - typed.length;
    }

    // The space separating words counts as a correct character when the word
    // was completed and the user advanced past it (i.e. not the last word).
    if (w < wordsReached - 1) {
      correct++; // the space
    }
  }

  return { correct, incorrect, extra, missed };
}

export function calculateWpm(correctChars: number, seconds: number): number {
  if (seconds <= 0) return 0;
  return round2((correctChars / 5) / (seconds / 60));
}

export function calculateRawWpm(allTypedChars: number, seconds: number): number {
  if (seconds <= 0) return 0;
  return round2((allTypedChars / 5) / (seconds / 60));
}

export function calculateAccuracy(kp: KeypressCounters): number {
  const total = kp.correct + kp.incorrect;
  if (total === 0) return 100;
  return round2((kp.correct / total) * 100);
}

/**
 * Consistency = 100 * (1 - coefficient of variation of per-second raw WPM).
 * A perfectly steady pace → 100; a wildly varying pace → towards 0.
 */
export function calculateConsistency(rawData: readonly RawDataPoint[]): number {
  const samples = rawData.map((d) => d.raw).filter((v) => v > 0);
  if (samples.length < 2) return samples.length === 1 ? 100 : 0;

  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  if (mean === 0) return 0;

  const variance =
    samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
  const stdev = Math.sqrt(variance);
  const cv = stdev / mean;
  return round2(Math.max(0, Math.min(100, (1 - cv) * 100)));
}

/** Assemble the final result from raw engine output. */
export function buildResultStats(input: {
  targets: readonly string[];
  typedPerWord: readonly string[];
  keypresses: KeypressCounters;
  rawData: readonly RawDataPoint[];
  durationSeconds: number;
}): ComputedStats {
  const charStats = computeCharStats(input.targets, input.typedPerWord);
  const allTyped = charStats.correct + charStats.incorrect + charStats.extra;
  const seconds = input.durationSeconds;

  return {
    wpm: calculateWpm(charStats.correct, seconds),
    rawWpm: calculateRawWpm(allTyped, seconds),
    accuracy: calculateAccuracy(input.keypresses),
    consistency: calculateConsistency(input.rawData),
    charStats,
    keypresses: input.keypresses,
    errors: input.keypresses.incorrect,
    keystrokes: input.keypresses.correct + input.keypresses.incorrect,
    durationSeconds: round2(seconds),
  };
}
