import type { IPrismaOptions } from "@interfaces/prisma";
import { envconfig } from "@libraries/envconfig";
import { logger } from "@libraries/logger";
import { Prisma, PrismaClient } from "@prisma/client";

const getTransaction = async (options?: IPrismaOptions) => {
    return options?.transaction || Database.instance;
};

const Loader = async () => {
    try {
        // const client = new PrismaClient();
        // await client.$connect();
        await Database.instance.$connect();
        logger.instance.debug(
            `✅ Prisma: Connected to ${envconfig.database.postgres.database} database on ${envconfig.database.postgres.host}.`
        );
    } catch (ex) {
        logger.instance.error(ex);
    }
}

export const Database = {
    instance: new PrismaClient(),
    getTransaction,
    Loader
}
