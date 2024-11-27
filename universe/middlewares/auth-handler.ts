import { AuthHelperService } from "@services/auth-helper";
import { PlatformError } from "@universe/errors";
import { NextFunction, Request, Response } from "express";

export const AuthHandlerMiddleware = (options = {
    halt: true
}) => (request: Request, response: Response, next: NextFunction): void => {
    if (request.method.toLocaleLowerCase() === 'options') {
        return next();
    }
    const {
        access_token
    } = AuthHelperService.getTokens(request, response);
    if (!access_token) {
        response.clearCookie(AuthHelperService.cookieKeys.access_token);
        response.clearCookie(AuthHelperService.cookieKeys.refresh_token);
        if (options.halt) {
            throw new PlatformError("NeedSignin", {}, 401);
        }
        return next();
    }

    try {
        AuthHelperService.setSession({
            access_token
        })
    } catch (e) {
        response.clearCookie(AuthHelperService.cookieKeys.access_token);
        response.clearCookie(AuthHelperService.cookieKeys.refresh_token);
        if (options.halt) {
            throw new PlatformError('NeedSignin', {}, 401);
        }
    }
    return next();
}