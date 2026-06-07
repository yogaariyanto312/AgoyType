/**
 * Server-side anti-cheat / bot detection.
 *
 * The client is never trusted: we recompute the headline metrics from the raw
 * character breakdown and per-second telemetry, then run a battery of
 * plausibility heuristics. A result is never silently accepted as a record if it
 * trips any check — it is stored but `flagged`, and flagged results are excluded
 * from leaderboards and personal bests.
 */

import { calculateWpm } from "./stats";
import type { SubmitResultInput } from "./validations";

export interface AntiCheatVerdict {
  flagged: boolean;
  reason?: string;
  /** server-recomputed WPM used for record eligibility */
  verifiedWpm: number;
}

// A safe ceiling above the human world record for sustained typing.
const HUMAN_WPM_CEILING = 260;

export function evaluateResult(input: SubmitResultInput): AntiCheatVerdict {
  const { charStats, duration, rawData } = input;
  const totalTyped = charStats.correct + charStats.incorrect + charStats.extra;

  // 1) Recompute WPM from the character breakdown and compare with the claim.
  const verifiedWpm = calculateWpm(charStats.correct, duration);
  const claimedWpm = input.wpm;
  const drift =
    claimedWpm > 0 ? Math.abs(verifiedWpm - claimedWpm) / claimedWpm : 0;

  if (drift > 0.1 && Math.abs(verifiedWpm - claimedWpm) > 3) {
    return {
      flagged: true,
      reason: `metric_mismatch (claimed ${claimedWpm}, verified ${verifiedWpm})`,
      verifiedWpm,
    };
  }

  // 2) Superhuman sustained speed.
  if (verifiedWpm > HUMAN_WPM_CEILING) {
    return { flagged: true, reason: "superhuman_speed", verifiedWpm };
  }

  // 3) Keystrokes must at least cover the characters that ended up on screen.
  if (input.keystrokes < totalTyped - 1) {
    return { flagged: true, reason: "keystroke_undercount", verifiedWpm };
  }

  // 4) Telemetry sanity: a non-trivial test must produce per-second samples,
  //    and the number of samples should roughly track the elapsed time.
  if (duration >= 4) {
    if (rawData.length === 0) {
      return { flagged: true, reason: "no_telemetry", verifiedWpm };
    }
    const expected = Math.floor(duration);
    if (rawData.length < Math.max(2, expected * 0.5)) {
      return { flagged: true, reason: "telemetry_too_sparse", verifiedWpm };
    }
  }

  // 5) Robotic perfection: very high speed with zero pace variance is bot-like.
  if (verifiedWpm > 150 && rawData.length >= 4) {
    const samples = rawData.map((d) => d.raw).filter((v) => v > 0);
    if (samples.length >= 4) {
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance =
        samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
      if (variance < 0.5) {
        return { flagged: true, reason: "no_pace_variance", verifiedWpm };
      }
    }
  }

  // 6) Accuracy / consistency must be within bounds (defensive; zod also checks).
  if (input.accuracy > 100 || input.consistency > 100) {
    return { flagged: true, reason: "out_of_range_metric", verifiedWpm };
  }

  // 7) Claimed accuracy must be consistent with the keystroke/error counts.
  //    By definition accuracy = (keystrokes - errors) / keystrokes * 100, so a
  //    client that reports a mismatching accuracy (or more errors than
  //    keystrokes) has tampered with the figures.
  if (input.keystrokes > 0) {
    if (input.errors > input.keystrokes) {
      return { flagged: true, reason: "errors_exceed_keystrokes", verifiedWpm };
    }
    const impliedAccuracy =
      ((input.keystrokes - input.errors) / input.keystrokes) * 100;
    if (Math.abs(impliedAccuracy - input.accuracy) > 2) {
      return {
        flagged: true,
        reason: `accuracy_inconsistent (claimed ${input.accuracy}, implied ${
          Math.round(impliedAccuracy * 100) / 100
        })`,
        verifiedWpm,
      };
    }
  }

  return { flagged: false, verifiedWpm };
}
