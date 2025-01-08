import { AuthService } from "@services/auth";
import { ContextService } from "@services/context";
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
};

const SignIn = async (req: Request, res: Response) => {
    const response = await AuthService.SignIn(req.body);
    if (response.content.meta) {
        const cookieResponse = AuthService.createCookie(res, response.content.meta);
        delete response.content.meta;
        return cookieResponse.json(response.content);
    }
    throw new PlatformError('RefreshAgain');
};

const SignOut = async (req: Request, res: Response) => {
    const cookieResponse = AuthService.clearCookie(res);

    return cookieResponse.json({
        status: true,
    });
};

const GetMe = async (req: Request, res: Response) => {
    const session = ContextService.GetSession();

    const data = await AuthService.GetMe(session);
    return res.json({
        status: true,
        content: {
            data
        }
    });
}


export const AuthController = {
    /**
     * Handles user sign-up requests.
     * 
     * @function SignUp
     * @async
     * @param {Request} req - The HTTP request object containing user registration data in the body.
     * @param {Response} res - The HTTP response object to send the result.
     * 
     * @returns {Promise<Response>} - JSON response containing user registration data or error details.
     * - If `meta` is present in the response, a cookie is created and included in the response.
     * - Otherwise, returns the response as JSON.
    */
    SignUp,
    /**
     * Handles user sign-in requests.
     * 
     * @function SignIn
     * @async
     * @param {Request} req - The HTTP request object containing user login credentials in the body.
     * @param {Response} res - The HTTP response object to send the result.
     * 
     * @throws {PlatformError} - Throws 'RefreshAgain' error if authentication requires a refresh.
     * @returns {Promise<Response>} - JSON response containing user authentication data or error details.
     * - If `meta` is present in the response, a cookie is created and included in the response.
     * - Otherwise, throws an error.
    */
    SignIn,
    /**
     * Handles user sign-out requests.
     * 
     * @function SignOut
     * @async
     * @param {Request} req - The HTTP request object (unused in this handler).
     * @param {Response} res - The HTTP response object to send the result.
     * 
     * @returns {Promise<Response>} - JSON response indicating sign-out success and clearing cookies.
     * - The response contains `{ status: true }` and clears any authentication-related cookies.
    */
    SignOut,

    GetMe
};