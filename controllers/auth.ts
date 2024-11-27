import { AuthService } from "@services/auth";
import { PlatformError } from "@universe/errors";
import type { Request, Response } from "express";

const SignUp = async (req: Request, res: Response) => {
    const response = await AuthService.SignUp(req.body);
    if (response.content.meta) {
        const cookieResponse = AuthService.createCookie(res, response.content.meta);
        delete response.content.meta;
        return cookieResponse.json(response.content);
    }
    return res.json(response);
}

const SignIn = async (req: Request, res: Response) => {
    const response = await AuthService.SignIn(req.body);
    if (response.content.meta) {
        const cookieResponse = AuthService.createCookie(res, response.content.meta);
        delete response.content.meta;
        return cookieResponse.json(response.content);
    }
    throw new PlatformError('RefreshAgain');
}

export const AuthController = {
    SignUp,
    SignIn
};