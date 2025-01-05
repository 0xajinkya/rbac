import { scopes } from "@config/constants";
import { UserController } from "@controllers/user";
import { AuthHandlerMiddleware } from "@middlewares/auth-handler";
import { ScopeHandlerMiddleware } from "@middlewares/scope-handler";
import { Router } from "express";

export const UserRouter = Router();

UserRouter.get(
    "/:organization_id/add-in-organization",
    AuthHandlerMiddleware(),
    ScopeHandlerMiddleware(scopes.staff.read),
    //@ts-ignore
    UserController.ListUserToAddInOrganization
)