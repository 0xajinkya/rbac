import 'express-async-errors';
import express from 'express';
import cookieparser from 'cookie-parser';
import { envconfig } from '@libraries/envconfig';
import { logger } from '@libraries/logger';
import cors from "cors";

export const FrameworkLoader = ({ app }: {
    app: express.Application
}): void => {
    app.enable("trust proxy");

    app.use(cors({
        origin: 'http://localhost:3001', // Allow requests from the frontend
        credentials: true         // Allow cookies
    }));

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "http://localhost:3001");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Org");
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
        res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        next();
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