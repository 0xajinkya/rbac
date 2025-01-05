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

OrganizationRouter.get(
    "/get-member-organizations",
    AuthHandlerMiddleware(),
    //@ts-ignore
    OrganizationController.GetMemberOrganizations
);

OrganizationRouter.get(
    "/:id",
    AuthHandlerMiddleware(),
    //@ts-ignore
    OrganizationController.Get
);


OrganizationRouter.post(
    "/:id/login",
    AuthHandlerMiddleware(),
    //@ts-ignore
    OrganizationController.Login
)