import { AuthHandlerMiddleware } from "@middlewares/auth-handler";
import { OrganizationController } from "@controllers/organization";
import { Router } from "express";
import { ScopeHandlerMiddleware } from "@middlewares/scope-handler";
import { scopes } from "@config/constants";

export const OrganizationRouter = Router();

OrganizationRouter.post(
    "/",
    AuthHandlerMiddleware(),
    //@ts-ignore
    OrganizationController.Create
);