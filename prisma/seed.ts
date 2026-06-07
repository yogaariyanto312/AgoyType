/**
 * Database seed: achievements, word lists, quotes, and demo users with a
 * realistic spread of results / personal bests / daily stats.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient, type TestMode } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ACHIEVEMENTS } from "../src/lib/achievements";
import {
  ENGLISH_200,
  COMMON_500_EXTRA,
  INDONESIAN_200,
  INDONESIAN_EXTRA,
} from "../src/lib/words";
import { QUOTES } from "../src/lib/quotes";

const prisma = new PrismaClient();

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

async function seedAchievements() {
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: { name: a.name, description: a.description, icon: a.icon, tier: a.tier },
      create: a,
    });
  }
  console.log(`✓ ${ACHIEVEMENTS.length} achievements`);
}

async function seedContent() {
  await prisma.wordList.upsert({
    where: { language: "english" },
    update: { words: [...ENGLISH_200, ...COMMON_500_EXTRA] },
    create: {
      language: "english",
      name: "English",
      words: [...ENGLISH_200, ...COMMON_500_EXTRA],
    },
  });
  console.log("✓ word list: english");

  await prisma.wordList.upsert({
    where: { language: "indonesian" },
    update: { words: [...INDONESIAN_200, ...INDONESIAN_EXTRA] },
    create: {
      language: "indonesian",
      name: "Indonesian",
      words: [...INDONESIAN_200, ...INDONESIAN_EXTRA],
    },
  });
  console.log("✓ word list: indonesian");

  // refresh quotes
  await prisma.quote.deleteMany({});
  for (const q of QUOTES) {
    await prisma.quote.create({
      data: {
        text: q.text,
        source: q.source,
        length: q.length,
        language: q.language ?? "english",
      },
    });
  }
  console.log(`✓ ${QUOTES.length} quotes`);
}

function generateRawData(durationSec: number, targetWpm: number) {
  const points = [];
  let errors = 0;
  for (let t = 1; t <= Math.floor(durationSec); t++) {
    const raw = round2(targetWpm + randBetween(-12, 12));
    const wpm = round2(Math.max(0, raw - randBetween(0, 6)));
    if (Math.random() < 0.15) errors += 1;
    points.push({ t, wpm, raw: Math.max(0, raw), errors });
  }
  return points;
}

async function seedUser(opts: {
  username: string;
  email: string;
  password: string;
  role?: "USER" | "ADMIN";
  skill: number; // average wpm
  tests: number;
}) {
  const passwordHash = await bcrypt.hash(opts.password, 12);
  const user = await prisma.user.upsert({
    where: { email: opts.email },
    update: {},
    create: {
      username: opts.username,
      name: opts.username,
      email: opts.email,
      password: passwordHash,
      role: opts.role ?? "USER",
      bio: `Hi, I'm ${opts.username} and I love typing fast.`,
      keyboard: "Custom 65% with Gateron Browns",
    },
  });

  // clear previous demo results for idempotency
  await prisma.result.deleteMany({ where: { userId: user.id } });
  await prisma.personalBest.deleteMany({ where: { userId: user.id } });
  await prisma.dailyStat.deleteMany({ where: { userId: user.id } });

  const modes: { mode: TestMode; mode2: string; duration: number }[] = [
    { mode: "TIME", mode2: "time:15", duration: 15 },
    { mode: "TIME", mode2: "time:30", duration: 30 },
    { mode: "TIME", mode2: "time:60", duration: 60 },
    { mode: "WORDS", mode2: "words:25", duration: 22 },
    { mode: "WORDS", mode2: "words:50", duration: 44 },
  ];

  const bestByKey = new Map<string, number>();

  for (let i = 0; i < opts.tests; i++) {
    const cfg = modes[Math.floor(Math.random() * modes.length)];
    const wpm = round2(Math.max(20, randBetween(opts.skill - 20, opts.skill + 20)));
    const rawWpm = round2(wpm + randBetween(2, 12));
    const accuracy = round2(randBetween(90, 100));
    const consistency = round2(randBetween(65, 96));
    const keystrokes = Math.round((wpm * 5 * cfg.duration) / 60);
    const errors = Math.round(keystrokes * (1 - accuracy / 100));
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000);

    const correct = Math.round((wpm * 5 * cfg.duration) / 60);
    const result = await prisma.result.create({
      data: {
        userId: user.id,
        wpm,
        rawWpm,
        accuracy,
        consistency,
        errors,
        keystrokes,
        mode: cfg.mode,
        mode2: cfg.mode2,
        language: "english",
        duration: cfg.duration,
        charStats: { correct, incorrect: errors, extra: 0, missed: 0 },
        rawData: generateRawData(cfg.duration, wpm),
        createdAt,
      },
    });

    const key = `${cfg.mode}|${cfg.mode2}|english`;
    const prevBest = bestByKey.get(key) ?? 0;
    if (wpm > prevBest) {
      bestByKey.set(key, wpm);
      await prisma.personalBest.upsert({
        where: {
          userId_mode_mode2_language: {
            userId: user.id,
            mode: cfg.mode,
            mode2: cfg.mode2,
            language: "english",
          },
        },
        update: { wpm, rawWpm, accuracy, consistency, resultId: result.id, achievedAt: createdAt },
        create: {
          userId: user.id,
          mode: cfg.mode,
          mode2: cfg.mode2,
          language: "english",
          wpm,
          rawWpm,
          accuracy,
          consistency,
          resultId: result.id,
          achievedAt: createdAt,
        },
      });
    }

    // daily stat aggregation
    const day = new Date(createdAt);
    day.setUTCHours(0, 0, 0, 0);
    await prisma.dailyStat.upsert({
      where: { userId_day: { userId: user.id, day } },
      update: {
        testsCompleted: { increment: 1 },
        timeTyping: { increment: cfg.duration },
        totalWpm: { increment: wpm },
        keystrokes: { increment: keystrokes },
        bestWpm: prevBest < wpm ? wpm : undefined,
      },
      create: {
        userId: user.id,
        day,
        testsCompleted: 1,
        timeTyping: cfg.duration,
        totalWpm: wpm,
        bestWpm: wpm,
        keystrokes,
      },
    });
  }

  // unlock a few achievements based on best wpm
  const best = Math.max(0, ...bestByKey.values());
  const keys = ["first_test", "tests_10"];
  if (best >= 60) keys.push("speed_60");
  if (best >= 80) keys.push("speed_80");
  if (best >= 100) keys.push("speed_100");
  if (opts.tests >= 100) keys.push("tests_100");
  for (const key of keys) {
    const ach = await prisma.achievement.findUnique({ where: { key } });
    if (ach) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId: user.id, achievementId: ach.id } },
        update: {},
        create: { userId: user.id, achievementId: ach.id },
      });
    }
  }

  console.log(`✓ user ${opts.username} (${opts.tests} results, best ${best} wpm)`);
  return user;
}

async function main() {
  console.log("Seeding AgoyType database…");
  await seedAchievements();
  await seedContent();

  await seedUser({ username: "admin", email: "admin@agoytype.dev", password: "admin12345", role: "ADMIN", skill: 110, tests: 120 });
  await seedUser({ username: "speedy", email: "speedy@agoytype.dev", password: "password123", skill: 135, tests: 80 });
  await seedUser({ username: "ada", email: "ada@agoytype.dev", password: "password123", skill: 95, tests: 60 });
  await seedUser({ username: "lin", email: "lin@agoytype.dev", password: "password123", skill: 75, tests: 40 });

  console.log("\nDone. Demo login: admin@agoytype.dev / admin12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
