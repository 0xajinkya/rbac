import type { IUser, IUserCreate, IUserWithoutPassword } from "@interfaces/identity"
import type { IPrismaOptions } from "@interfaces/prisma";
import { envconfig } from "@libraries/envconfig";
import { helper } from "@libraries/helper";
import { Jwt } from "@libraries/jwt";
import { PlatformError, SchemaValidationError } from "@universe/errors";
import ms from 'ms';
import { UserService } from "./user";
import type { CookieOptions, Response } from "express";
import { AuthHelperService } from "./auth-helper";
import { ICommonUser, IResponse } from "@interfaces/common";
import Hash from "@libraries/hash";

const COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: typeof envconfig.authentication.cookie.ssl !== 'undefined',
    domain: envconfig.authentication.cookie.domain,
    sameSite:
        envconfig.authentication.cookie.sameSite &&
            ['none', 'lax', 'strict'].includes(
                envconfig.authentication.cookie.sameSite
            )
            ? envconfig.authentication.cookie.sameSite
            : 'lax',
    signed: false
};

const expiresIn = {
    access_token: ms(envconfig.authentication.jwt.expires_in || '30d'),
    csrf_token: ms('24h'),
    refresh_token: ms(envconfig.authentication.jwt.refresh_expires_in || '30d')
};

const SignUp = async (data: IUserCreate, options?: IPrismaOptions): Promise<IResponse<IUserWithoutPassword, {
    access_token: string;
    refresh_token: string;
}>> => {
    const response = await UserService.Create(data, options);

    if (!response) {
        throw new PlatformError('SomethingWentWrong');
    }
    const token = createToken(response);
    const {
        password,
        ...user
    } = response;
    return {
        status: true,
        content: {
            data: user,
            meta: token
        }
    };
}

const SignIn = async (data: {
    email: string;
    password: string;
}): Promise<IResponse<IUser, {
    access_token: string;
    refresh_token: string;
}>> => {
    const { email, password } = data;

    const email_sanitized = helper.getSanitizedEmail(email);
    if (!email_sanitized) {
        throw new SchemaValidationError([
            {
                message: 'Email address is invalid.',
                param: "email"
            }
        ]);
    }

    const user = await UserService.Get(email_sanitized);
    if (!user) {
        throw new PlatformError("ResourceNotFound", {
            resource: "User",
        })
    }
    await verifyPassword(user.password, password);

    const token = AuthService.createToken(user);

    return {
        status: true,
        content: {
            data: user,
            meta: token
        }
    }

}

const verifyPassword = async (hash: string, password?: string) => {
    if (password) {
        const result = await Hash.verifyPassword(password, hash);

        if (!result) {
            throw new PlatformError('InvalidCredentials');
        }

        return result;
    }
    throw new SchemaValidationError([
        {
            message: 'Password is required.',
            param: 'password'
        }
    ]);
}

const createToken = (user: IUser) => {
    if (!user) {
        throw new PlatformError("ResourceNotFound", {
            resource: "User",
        })
    };
    const jwtUser = {
        data: {
            id: user.id,
            email: user.email,
            active_organization_id: user.active_organization_id,
            first_name: user.first_name,
            last_name: user.last_name
        }
    };

    const access_token = Jwt.create(jwtUser, {
        jwtid: helper.getId(),
        expiresIn: `${expiresIn.refresh_token}ms`,
        subject: jwtUser.data.id
    })

    const refresh_token = Jwt.create(jwtUser, {
        jwtid: helper.getId(),
        expiresIn: `${expiresIn.refresh_token}ms`,
        subject: user.id
    });

    return { access_token, refresh_token };
}

const createCookie = (response: Response, data: {
    access_token: string | null;
    refresh_token: string | null;
}) => {
    if (data.access_token) {
        response.cookie(
            AuthHelperService.cookieKeys.access_token,
            data.access_token,
            {
                ...COOKIE_OPTIONS,
                maxAge: expiresIn.access_token
            }
        );
    }

    if (data.refresh_token) {
        response.cookie(
            AuthHelperService.cookieKeys.refresh_token,
            data.refresh_token,
            {
                ...COOKIE_OPTIONS,
                maxAge: expiresIn.refresh_token
            }
        );
    }
    return response;
}

const clearCookie = (response: Response) => {
    const cookies = [
        AuthHelperService.cookieKeys.access_token,
        AuthHelperService.cookieKeys.refresh_token,
    ];

    if (envconfig.env === 'production') {
        cookies.push('production_access_token');
        cookies.push('production_refresh_token');
    }

    // Iterate through each cookie and clear them from the response object
    for (const cookie of cookies) {
        response.clearCookie(cookie, COOKIE_OPTIONS);
    }

    // Return the response object with the cookies cleared
    return response;
}

const GetMe = async (session: ICommonUser) => {
    const user = await UserService.Get(session.id);
    if (!user) {
        throw new PlatformError("ResourceNotFound", {
            resource: "User",
        })
    }
    return user;
}

export const AuthService = {
    /**
     * Registers a new user and generates authentication tokens.
     * 
     * @function SignUp
     * @async
     * @param {IUserCreate} data - The user details required for registration.
     * @param {IPrismaOptions} [options] - Optional database options for the operation.
     * 
     * @throws {PlatformError} - If user creation fails or an unexpected error occurs.
     * 
     * @returns {Promise<IResponse<IUserWithoutPassword, { access_token: string, refresh_token: string }>>} 
     * - The response object contains user data (excluding the password) and authentication tokens.
    */
    SignUp,
    /**
     * Authenticates a user and generates authentication tokens.
     * 
     * @function SignIn
     * @async
     * @param {Object} data - The user credentials for login.
     * @param {string} data.email - The user's email address.
     * @param {string} data.password - The user's password.
     * 
     * @throws {SchemaValidationError} - If the email format is invalid.
     * @throws {PlatformError} - If the user is not found or the credentials are invalid.
     * 
     * @returns {Promise<IResponse<IUser, { access_token: string, refresh_token: string }>>}
     * - The response object contains user data and authentication tokens.
    */
    SignIn,
    /**
     * Creates JWT tokens for a user.
     * 
     * @function createToken
     * @param {IUser} user - The user object.
     * 
     * @throws {PlatformError} - If the user object is not provided.
     * 
     * @returns {{ access_token: string, refresh_token: string }} - The generated JWT tokens.
    */
    createToken,
    /**
     * Sets authentication cookies on the response object.
     * 
     * @function createCookie
     * @param {Response} response - The HTTP response object.
     * @param {Object} data - The tokens to be set in the cookies.
     * @param {string|null} data.access_token - The access token.
     * @param {string|null} data.refresh_token - The refresh token.
     * 
     * @returns {Response} - The response object with cookies set.
    */
    createCookie,
    /**
     * Verifies a user's password against a stored hash.
     * 
     * @function verifyPassword
     * @async
     * @param {string} hash - The stored password hash.
     * @param {string} [password] - The plaintext password to verify.
     * 
     * @throws {PlatformError} - If the credentials are invalid.
     * @throws {SchemaValidationError} - If no password is provided.
     * 
     * @returns {Promise<boolean>} - `true` if the password is valid, otherwise an error is thrown.
    */
    verifyPassword,
    /**
     * Clears authentication cookies from the response object.
     * 
     * @function clearCookie
     * @param {Response} response - The HTTP response object.
     * 
     * @returns {Response} - The response object with cookies cleared.
    */
    clearCookie,

    GetMe
}