import 'express-async-errors';
import express, { Request } from 'express';
import cookieparser from 'cookie-parser';
import { envconfig } from '@libraries/envconfig';
import { logger } from '@libraries/logger';

export const getHost = (request: Request) => {
    const host =
        request.get('origin') ||
        request.get('host') ||
        `${request.protocol}://${request.hostname}`;
    return host;
};

export const FrameworkLoader = ({ app }: {
    app: express.Application
}): void => {
    app.enable("trust proxy");

    //@ts-ignore
    app.all('*', (request, response, next) => {

        const host = getHost(request);

        if (envconfig.env) {
            const allowedOrigin = envconfig.authentication.domain;
            console.log(request.hostname);
            console.log(allowedOrigin);
            if (
                request.hostname &&
                    request.hostname.includes("https://") ? request.hostname.replace("https://", "").includes(allowedOrigin) : request.hostname.includes("http://") ? request.hostname.replace("http://", "").includes(allowedOrigin) : request.hostname.includes(allowedOrigin)
            ) {
                // Handles CORS
                response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
                response.setHeader('Access-Control-Allow-Credentials', 'true');
            }
        } else {
            if (
                request.hostname &&
                (request.hostname.includes(envconfig.authentication.domain) ||
                    typeof process.env.COOKIE_SAMESITE === 'undefined')
            ) {
                // Handles CORS
                response.setHeader('Access-Control-Allow-Origin', host);
                response.setHeader('Access-Control-Allow-Credentials', 'true');
            }
        }

        response.setHeader(
            'Access-Control-Allow-Headers',
            [
                'Content-Type',
                'Content-Length',
                'Authorization',
                'Accept',
                'X-Requested-With'
            ].join(',')
        );
        response.setHeader(
            'Access-Control-Allow-Methods',
            'PUT,POST,GET,DELETE,OPTIONS'
        );

        if (request.method.toLowerCase() === 'options') {
            // Respond with 200
            return response.sendStatus(200);
        }

        return next();
    });


    if (envconfig.env === 'development') {
        app.use(
            (
                request: express.Request,
                response: express.Response,
                next: express.NextFunction
            ) => {
                logger.instance.debug(`${request.method} ${request.url}`);
                return next();
            }
        );
    }

    app.use(cookieparser(envconfig.authentication.cookie.secret));
    app.use(
        express.json({
            limit: '100mb'
        })
    );
}