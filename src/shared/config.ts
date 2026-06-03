import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000"),

  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_ALLOWED_USER_ID: z.string().min(1),

  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_INTERVIEW_MODEL: z.string().default("gpt-4o"),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  WEBHOOK_URL: z.string().optional(),
  BRIEFING_HOUR: z.string().default("7"),
  BRIEFING_MINUTE: z.string().default("0"),
  TIMEZONE: z.string().default("Asia/Ho_Chi_Minh"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

const env = parsed.data;

export const config = {
  isDev: env.NODE_ENV === "development",
  isProd: env.NODE_ENV === "production",
  port: parseInt(env.PORT, 10),

  telegram: {
    botToken: env.TELEGRAM_BOT_TOKEN,
    allowedUserId: parseInt(env.TELEGRAM_ALLOWED_USER_ID, 10),
    webhookUrl: env.WEBHOOK_URL,
  },

  ai: {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    interviewModel: env.OPENAI_INTERVIEW_MODEL,
  },

  db: { url: env.DATABASE_URL },
  redis: { url: env.REDIS_URL },

  briefing: {
    hour: parseInt(env.BRIEFING_HOUR, 10),
    minute: parseInt(env.BRIEFING_MINUTE, 10),
    timezone: env.TIMEZONE,
  },
} as const;