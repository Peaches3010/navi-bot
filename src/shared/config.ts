import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000"),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),
  TELEGRAM_ALLOWED_USER_ID: z
    .string()
    .min(1, "TELEGRAM_ALLOWED_USER_ID is required"),

  // AI
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // Webhook
  WEBHOOK_URL: z.string().optional(),
});

// Validate khi app khởi động
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  isDev: parsed.data.NODE_ENV === "development",
  isProd: parsed.data.NODE_ENV === "production",
  port: parseInt(parsed.data.PORT, 10),

  telegram: {
    botToken: parsed.data.TELEGRAM_BOT_TOKEN,
    allowedUserId: parseInt(parsed.data.TELEGRAM_ALLOWED_USER_ID, 10),
    webhookUrl: parsed.data.WEBHOOK_URL,
  },

  ai: {
    apiKey: parsed.data.OPENAI_API_KEY,
    model: parsed.data.OPENAI_MODEL,
  },

  redis: {
    url: parsed.data.REDIS_URL,
  },
} as const;