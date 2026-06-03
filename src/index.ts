import { bot } from "./bot/index.js";
import { connectDB } from "./db/client.js";
import { logger } from "./shared/logger.js";
import { config } from "./shared/config.js";

async function main(): Promise<void> {
  logger.info("Starting Navi Bot...");

  // Connect database
  await connectDB();

  // Start bot
  if (config.isProd && config.telegram.webhookUrl) {
    logger.info("Starting in webhook mode...");
    // Webhook setup sẽ làm sau
  } else {
    logger.info("Starting in polling mode...");
    await bot.start({
      onStart: (botInfo) => {
        logger.info({ username: botInfo.username }, "Bot is running...");
      },
    });
  }
}

main().catch((error) => {
  logger.error({ error }, "Fatal error");
  process.exit(1);
});