import { Bot } from "grammy";


import { authMiddleware } from "./middleware/auth.middleware.js";
import { sessionMiddleware } from "./middleware/session.middleware.js";
import { config } from "../shared/config.js";
import { logger } from "../shared/logger.js";

export const bot = new Bot(config.telegram.botToken);

// Middlewares
bot.use(authMiddleware);
bot.use(sessionMiddleware);

// Start command
bot.command("start", async (ctx) => {
  await ctx.reply(
    `Xin chào! Mình là *Navi*, trợ lý cá nhân của bạn.\n\n` +
    `Mình có thể giúp bạn:\n` +
    `• Quản lý lịch & reminder\n` +
    `• Luyện phỏng vấn kỹ thuật\n` +
    `• Review & phân tích code\n\n` +
    `Hãy thử nói chuyện tự nhiên với mình nhé!`,
    { parse_mode: "Markdown" }
  );
});

// Help command
bot.command("help", async (ctx) => {
  await ctx.reply(
    `*Các lệnh có thể dùng:*\n\n` +
    ` *Calendar*\n` +
    `• Nhắn tự nhiên: "Nhắc mình họp lúc 3h"\n` +
    `• /today — xem lịch hôm nay\n\n` +
    ` *Interview*\n` +
    `• /interview — bắt đầu luyện phỏng vấn\n\n` +
    ` *Vibe Code*\n` +
    `• /review — review code\n` +
    `• /explain — giải thích code\n\n` +
    ` /cancel — huỷ thao tác hiện tại`,
    { parse_mode: "Markdown" }
  );
});

// Cancel command
bot.command("cancel", async (ctx) => {
  await ctx.reply("Đã huỷ. Mình có thể giúp gì khác không?");
});

logger.info("Bot initialized");