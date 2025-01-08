import { afterAll, beforeAll } from "bun:test";
import { Server } from "../server";
import { logger } from "@libraries/logger";
import { envconfig } from "@libraries/envconfig";
import { Database } from "@universe/loaders/database";

beforeAll(async () => {
    logger.Loader();
    const {
        app
    } = await Server();
    logger.instance.debug(
        `🚀 starting the platform server on port ${envconfig.url.platform}`
    );
    app.listen(envconfig.port);
});

afterAll(async () => {
    await Database.Close();
});