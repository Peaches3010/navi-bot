import type { Context, NextFunction } from "grammy";
import { config } from "../../shared/config.js";
import { logger } from "../../shared/logger.js";

export async function authMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  const userId = ctx.from?.id;

  if (!userId) {
    logger.warn("Request without user ID");
    return;
  }

  if (userId !== config.telegram.allowedUserId) {
    logger.warn({ userId }, "Unauthorized access attempt");
    await ctx.reply("Bạn không có quyền sử dụng bot này.");
    return;
  }

  await next();
}