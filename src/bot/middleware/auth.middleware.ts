import type { Context, NextFunction } from "grammy";
import { config } from "../../shared/config.js";
import { logger } from "../../shared/logger.js";

export async function authMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  const userId = ctx.from?.id;

  const rateLimitMap = new Map<number, number>();
  const RATE_LIMIT_MS = 1000; // 1 request/giây



  if (!userId) {
    logger.warn("Request without user ID");
    return;
  }

  if (userId) {
  const lastRequest = rateLimitMap.get(userId) ?? 0;
  if (Date.now() - lastRequest < RATE_LIMIT_MS) {
    await ctx.reply("Chậm thôi nào!");
    return;
  }
  rateLimitMap.set(userId, Date.now());
}

  if (userId !== config.telegram.allowedUserId) {
    logger.warn({ userId }, "Unauthorized access attempt");
    await ctx.reply("Bạn không có quyền sử dụng bot này.");
    return;
  }

  await next();
}