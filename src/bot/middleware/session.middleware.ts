import type { Context, NextFunction } from "grammy";
import { sessionStore } from "../../services/session.store.js";
import { logger } from "../../shared/logger.js";

export async function sessionMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  const userId = ctx.from?.id;

  if (!userId) {
    await next();
    return;
  }

  const session = sessionStore.get(userId);

  logger.debug(
    { userId, state: session.state, module: session.active_module },
    "Session loaded"
  );

  await next();
}