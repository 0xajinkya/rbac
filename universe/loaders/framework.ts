import 'express-async-errors';
import express, { Request } from 'express';
import cookieparser from 'cookie-parser';
import { envconfig } from '@libraries/envconfig';
import { logger } from '@libraries/logger';
import cors from "cors";

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

    // app.use(cors({
    //     origin: envconfig.authentication.domain, // Allow requests from the frontend
    //     credentials: true         // Allow cookies
    // }));

    // app.use((req, res, next) => {
    //     res.header("Access-Control-Allow-Origin", envconfig.authentication.domain);
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Org");
    //     res.header('Access-Control-Allow-Credentials', 'true');
    //     res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    //     res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    //     next();
    // });
    //@ts-ignore
    app.all('*', (request, response, next) => {

        const host = getHost(request);

        if (
            request.hostname &&
            (request.hostname.includes(envconfig.authentication.domain) ||
                typeof process.env.COOKIE_SAMESITE === 'undefined')
        ) {
            // Handles CORS
            response.setHeader('Access-Control-Allow-Origin', host);
            response.setHeader('Access-Control-Allow-Credentials', 'true');
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