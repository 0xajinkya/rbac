import { ErrorHandler } from "@middlewares/error-handler";
import { NotFoundError } from "@universe/errors";
import express from "express";
import { AppLoader } from "@universe/loaders";
import { logger } from "@libraries/logger";
import { AuthRouter } from "@api/auth";
import { OrganizationRouter } from "@api/organization";
import { StaffRouter } from "@api/staff";
import { BlogRouter } from "@api/blog";
import { UserRouter } from "@api/user";

/**
 * Initializes and configures the Express server.
 * Sets up routes, middleware, and error handling for the application.
 * 
 * @returns {Object} - The initialized Express application instance.
 */
export const Server = async () => {
    const app = express();

    // Load application dependencies and configurations.
    AppLoader({ app }).catch((e) => logger.instance.error(e));

    /**
     * @route GET /
     * @description Basic endpoint to check server status.
     * @response {string} - Returns "Hello World!" message.
     */
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    /**
     * @route /v1/auth
     * @description Routes for authentication-related operations.
     */
    app.use("/v1/auth", AuthRouter);

    app.use("/v1/user", UserRouter)

    /**
     * @route /v1/organization
     * @description Routes for managing organization data.
     */
    app.use("/v1/organization", OrganizationRouter);

    /**
     * @route /v1/staff
     * @description Routes for staff management and operations.
     */
    app.use("/v1/staff", StaffRouter);

    /**
     * @route /v1/blog
     * @description Routes for managing blog posts and related actions.
     */
    app.use("/v1/blog", BlogRouter);

    /**
     * @route *
     * @description Catch-all route for undefined paths.
     * @throws {NotFoundError} - Throws a 404 error for unknown routes.
     */
    app.all("*", async () => {
        throw new NotFoundError();
    });

    /**
     * @middleware ErrorHandler
     * @description Handles application errors and sends appropriate responses.
     */
    //@ts-ignore
    app.use(ErrorHandler);

    return {
        app,
    };
};
