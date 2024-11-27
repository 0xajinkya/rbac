import { AuthController } from "@controllers/auth";
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