import type { IPrismaOptions } from "@interfaces/prisma";
import { envconfig } from "@libraries/envconfig";
import { logger } from "@libraries/logger";
import { Prisma, PrismaClient } from "@prisma/client";

const getTransaction = async (options?: IPrismaOptions) => {
    return options?.transaction || Database.instance;
};

const Loader = async () => {
    try {
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
    /**
     * Retrieves the active database transaction or the default database instance.
     * 
     * @function getTransaction
     * @async
     * @param {IPrismaOptions} [options] - Optional Prisma options containing a transaction.
     * 
     * @returns {Promise<PrismaClient | Transaction>} - The active transaction if provided in `options`, otherwise the default database instance.
    */
    getTransaction,
    /**
     * Initializes the database connection using Prisma and logs the connection status.
     * 
     * @function Loader
     * @async
     * 
     * @description
     * - Establishes a connection to the database using Prisma.
     * - Logs a success message if the connection is established, or logs an error if the connection fails.
     * 
     * @example
     * await Loader();
     * // Logs:
     * // ✅ Prisma: Connected to <database_name> database on <host>.
    */
    Loader
}
