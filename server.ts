import { ErrorHandler } from "@middlewares/error-handler";
import { NotFoundError } from "@universe/errors";
import express from "express";
import { AppLoader } from "@universe/loaders";
import { logger } from "@libraries/logger";
import { AuthRouter } from "@api/auth";
import { OrganizationRouter } from "@api/organization";
import { StaffRouter } from "@api/staff";
import { BlogRouter } from "@api/blog";

export const Server = async () => {
    const app = express();

    AppLoader({ app }).catch((e) => logger.instance.error(e));

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.use("/v1/auth", AuthRouter);
    app.use("/v1/organization", OrganizationRouter);
    app.use("/v1/staff", StaffRouter);
    app.use("/v1/blog", BlogRouter)

    app.all("*", async () => {
        throw new NotFoundError();
    });

    //@ts-ignore
    app.use(ErrorHandler);

    return {
        app
    }
}