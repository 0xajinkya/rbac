import { scopes } from "@config/constants";
import { StaffController } from "@controllers/staff";
import { AuthHandlerMiddleware } from "@middlewares/auth-handler";
import { ScopeHandlerMiddleware } from "@middlewares/scope-handler";
import { Router } from "express";

export const StaffRouter = Router();

StaffRouter.post(
    "/",
    AuthHandlerMiddleware(),
    ScopeHandlerMiddleware(scopes.staff.create),
    //@ts-ignore
    StaffController.Add
);

StaffRouter.post(
    "/query",
    AuthHandlerMiddleware(),
    ScopeHandlerMiddleware(scopes.staff.read),
    //@ts-ignore
    StaffController.List
);

StaffRouter.delete(
    "/:id",
    AuthHandlerMiddleware(),
    ScopeHandlerMiddleware(scopes.staff.update),
    //@ts-ignore
    StaffController.Delete
)

StaffRouter.get(
    "/me",
    AuthHandlerMiddleware(),
    ScopeHandlerMiddleware(scopes.staff.read),
    //@ts-ignore
    StaffController.GetMe
)