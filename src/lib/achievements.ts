/** Achievement definitions and unlock logic. */

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "first_test", name: "First Steps", description: "Complete your first typing test", icon: "Footprints", tier: "bronze" },
  { key: "tests_10", name: "Getting Warmed Up", description: "Complete 10 tests", icon: "Flame", tier: "bronze" },
  { key: "tests_100", name: "Dedicated", description: "Complete 100 tests", icon: "Medal", tier: "silver" },
  { key: "tests_1000", name: "Keyboard Warrior", description: "Complete 1000 tests", icon: "Swords", tier: "platinum" },
  { key: "speed_60", name: "Cruising", description: "Reach 60 WPM", icon: "Gauge", tier: "bronze" },
  { key: "speed_80", name: "Fast Fingers", description: "Reach 80 WPM", icon: "Zap", tier: "silver" },
  { key: "speed_100", name: "Century", description: "Reach 100 WPM", icon: "Rocket", tier: "gold" },
  { key: "speed_120", name: "Blazing", description: "Reach 120 WPM", icon: "Flame", tier: "gold" },
  { key: "speed_150", name: "Superhuman", description: "Reach 150 WPM", icon: "Crown", tier: "platinum" },
  { key: "accuracy_100", name: "Flawless", description: "100% accuracy on a 25+ word test", icon: "Target", tier: "gold" },
  { key: "consistency_90", name: "Steady Hands", description: "90%+ consistency", icon: "Activity", tier: "silver" },
  { key: "marathon", name: "Marathon", description: "Complete a 120s test", icon: "Timer", tier: "silver" },
];

export interface AchievementContext {
  wpm: number;
  accuracy: number;
  consistency: number;
  keystrokes: number;
  durationSeconds: number;
  totalTests: number; // including the current one
}

/** Return achievement keys newly satisfied by this result. */
export function evaluateAchievements(
  ctx: AchievementContext,
  alreadyUnlocked: Set<string>,
): string[] {
  const unlocked: string[] = [];
  const add = (key: string, condition: boolean) => {
    if (condition && !alreadyUnlocked.has(key)) unlocked.push(key);
  };

  add("first_test", ctx.totalTests >= 1);
  add("tests_10", ctx.totalTests >= 10);
  add("tests_100", ctx.totalTests >= 100);
  add("tests_1000", ctx.totalTests >= 1000);
  add("speed_60", ctx.wpm >= 60);
  add("speed_80", ctx.wpm >= 80);
  add("speed_100", ctx.wpm >= 100);
  add("speed_120", ctx.wpm >= 120);
  add("speed_150", ctx.wpm >= 150);
  add("accuracy_100", ctx.accuracy >= 100 && ctx.keystrokes >= 125);
  add("consistency_90", ctx.consistency >= 90);
  add("marathon", ctx.durationSeconds >= 119);

  return unlocked;
}
