import { AuthController } from "@controllers/auth";
import { AuthHandlerMiddleware } from "@middlewares/auth-handler";
import { Router } from "express";

export const AuthRouter = Router();

AuthRouter.post(
    "/signup",
    //@ts-ignore
    AuthController.SignUp
);

AuthRouter.post(
    "/signin",
    //@ts-ignore
    AuthController.SignIn
);

AuthRouter.get(
    "/me",
    [AuthHandlerMiddleware()],
    //@ts-ignore
    AuthController.GetMe
)

AuthRouter.post(
    "/signout",
    //@ts-ignore
    AuthController.SignOut
)