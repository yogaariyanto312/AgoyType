import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscore allowed"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const charStatsSchema = z.object({
  correct: z.number().int().min(0).max(1_000_000),
  incorrect: z.number().int().min(0).max(1_000_000),
  extra: z.number().int().min(0).max(1_000_000),
  missed: z.number().int().min(0).max(1_000_000),
});

export const rawDataPointSchema = z.object({
  t: z.number().finite().min(0).max(7300),
  wpm: z.number().finite().min(0).max(1000),
  raw: z.number().finite().min(0).max(1000),
  errors: z.number().int().min(0).max(1_000_000),
});

// Restrict the free-text category/language tags to a safe, compact charset so
// clients cannot create junk leaderboard categories or oversized values.
const mode2Schema = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9:_-]+$/, "Invalid mode");
const languageSchema = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9_-]+$/, "Invalid language");

export const submitResultSchema = z.object({
  wpm: z.number().finite().min(0).max(400),
  rawWpm: z.number().finite().min(0).max(450),
  accuracy: z.number().finite().min(0).max(100),
  consistency: z.number().finite().min(0).max(100),
  errors: z.number().int().min(0).max(1_000_000),
  keystrokes: z.number().int().min(0).max(1_000_000),
  mode: z.enum(["TIME", "WORDS", "QUOTE", "CUSTOM", "ZEN"]),
  mode2: mode2Schema,
  language: languageSchema.default("english"),
  duration: z.number().finite().min(1).max(7200),
  testText: z.string().max(6000).optional(),
  charStats: charStatsSchema,
  rawData: z.array(rawDataPointSchema).max(7300),
});

export type SubmitResultInput = z.infer<typeof submitResultSchema>;

export const leaderboardQuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly", "alltime"]).default("alltime"),
  mode: z.enum(["TIME", "WORDS", "QUOTE", "CUSTOM", "ZEN"]).optional(),
  mode2: z.string().max(40).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const updateProfileSchema = z.object({
  bio: z.string().max(280).optional(),
  keyboard: z.string().max(60).optional(),
});
