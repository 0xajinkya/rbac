import type { IUser, IUserCreate } from "@interfaces/identity"
import type { IPrismaOptions } from "@interfaces/prisma";
import { envconfig } from "@libraries/envconfig";
import { helper } from "@libraries/helper";
import { Jwt } from "@libraries/jwt";
import { PlatformError, SchemaValidationError } from "@universe/errors";
import ms from 'ms';
import { UserService } from "./user";
import type { CookieOptions, Response } from "express";
import { AuthHelperService } from "./auth-helper";
import { IResponse } from "@interfaces/common";
import Hash from "@libraries/hash";

const COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: typeof envconfig.authentication.cookie.ssl !== 'undefined',
    domain: envconfig.authentication.domain,
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
    access_token: ms(envconfig.authentication.jwt.expires_in || '15m'),
    csrf_token: ms('24h'),
    refresh_token: ms(envconfig.authentication.jwt.refresh_expires_in || '30d')
};

const SignUp = async (data: IUserCreate, options?: IPrismaOptions): Promise<IResponse<IUser, {
    access_token: string;
    refresh_token: string;
}>> => {
    const response = await UserService.Create(data, options);

    if (!response) {
        throw new PlatformError('SomethingWentWrong');
    }
    const token = createToken(response);

    return {
        status: true,
        content: {
            data: response,
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

export const AuthService = {
    SignUp,
    SignIn,
    createToken,
    createCookie,
    verifyPassword
}