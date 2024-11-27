import { envconfig } from "@universe/libraries/envconfig";
import { logger } from "@universe/libraries/logger";
import { Server } from "server";

logger.Loader();

(async () => {
  Server().then(({ app }) => {
    app.listen(envconfig.port, () => {
      logger.instance.debug(`🚀 Listening http on port ${envconfig.port}`);
    });
  });
})();

process.on('SIGTERM', async (signal) => {
  logger.instance.info(signal);
  logger.instance.info(`Process ${process.pid} received a SIGTERM signal`);
  process.exit(0);
});

process.on('SIGINT', async (signal) => {
  logger.instance.info(signal);
  logger.instance.info(`Process ${process.pid} has been interrupted`);
  process.exit(0);
});

process.on('uncaughtException', async (err) => {
  logger.instance.error(err);
  logger.instance.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
