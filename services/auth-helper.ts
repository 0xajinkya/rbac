import type { ICommonUser, IContext, ITokenPayload, TCommonUser } from "@interfaces/common";
import { envconfig } from "@libraries/envconfig";
import { Jwt } from "@libraries/jwt";
import { Request, Response } from "express";
import { Context as CoreContext } from '@theinternetfolks/context';
import { PlatformError } from "@universe/errors";

const cookieKeys = {
    access_token:
        envconfig.env !== 'production'
            ? `${envconfig.env}_access_token`
            : 'access_token',
    refresh_token:
        envconfig.env !== 'production'
            ? `${envconfig.env}_refresh_token`
            : 'refresh_token',
};

const getOrganizationId = (request: Request): string | null => {
    const orgHeader = request.get("X-Org") !== undefined ? request.get('X-Org') : null;
    const res = !!orgHeader ? orgHeader : null;
    return res;
}

const getTokens = (request: Request, response: Response): {
    access_token: string | null;
    refresh_token: string | null;
} => {
    let {
        access_token = null
    } = response.locals;
    /**
     * Support for cookie named: `production_access_token`
     */
    if (!access_token && envconfig.env === 'production') {
        ({ production_access_token: access_token } = request.cookies);
    }
    if (!access_token) {
        ({ [cookieKeys.access_token]: access_token } =
            request.cookies);
    }
    let refresh_token: string | null = null;

    /**
     * Support for cookie named: `production_refresh_token`
     */
    if (!refresh_token && envconfig.env === 'production') {
        ({ production_refresh_token: refresh_token } = request.cookies);
    }

    if (!refresh_token) {
        ({ [AuthHelperService.cookieKeys.refresh_token]: refresh_token = null } =
            request.cookies);
    }
    if (access_token) {
        try {
            Jwt.verify(access_token);
        } catch (e) {
            access_token = null;
        }
    }
    return {
        access_token,
        refresh_token
    }
}

const setSession = ({ access_token }: {
    access_token: string;
    refresh_token?: string | null
}) => {
    const payload = Jwt.verify(access_token) as unknown as ITokenPayload<ICommonUser>
    CoreContext.set({
        session: payload.content.data,
        token: {
            access_token
        }
    });
    return payload.content;
}

const get = (): TCommonUser => {
    const { session } = CoreContext.get<IContext>() || {};

    if (!session) {
        throw new PlatformError('NeedSignin', {}, 401);
    }

    return session;
}

export const AuthHelperService = {
    cookieKeys,
    /**
     * Retrieves access and refresh tokens from the request and response objects.
     * 
     * @function getTokens
     * @param {Request} request - The request object to extract cookies from.
     * @param {Response} response - The response object containing local variables.
     * @returns {Object} - An object containing the access_token and refresh_token, or null if they are not found.
     * 
     * @throws {Error} - Throws an error if the access_token or refresh_token is invalid.
     */
    getTokens,
    /**
     * Sets the session context with the provided access token and refresh token.
     * 
     * @function setSession
     * @param {Object} tokens - An object containing the access_token and an optional refresh_token.
     * @param {string} tokens.access_token - The JWT access token.
     * @param {string} [tokens.refresh_token] - The optional JWT refresh token.
     * @returns {Object} - The payload content of the JWT.
     * 
     * @throws {Error} - Throws an error if the access token is invalid.
     */
    setSession,
    /**
     * Retrieves the session user data from the context.
     * 
     * @function get
     * @returns {TCommonUser} - The user data from the session.
     * 
     * @throws {PlatformError} - Throws a PlatformError if the user is not signed in.
     */
    get,
    /**
     * Retrieves the organization ID from the request's headers.
     * 
     * @function getOrganizationId
     * @param {Request} request - The request object containing the headers.
     * @returns {string | null} - The organization ID from the request's headers, or null if not found.
     */
    getOrganizationId
}