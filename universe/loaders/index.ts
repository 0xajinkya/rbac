import express from "express";
import { FrameworkLoader } from "./framework";
import { Database } from "./database";
import { logger } from "@libraries/logger";
import { Context } from "@theinternetfolks/context";

export const AppLoader = async ({
    app
}: {
    app?: express.Application
}) => {
    Promise.all([Database.Loader()]).catch((e) => logger.instance.error(e));
    if (app) {
        FrameworkLoader({ app });
        Context.Loader();
    }
}