import { envconfig } from "@libraries/envconfig";
import { logger } from "@libraries/logger";
import { Mate } from "@theinternetfolks/mate";
import { codes, CustomError } from "@universe/errors";
import express from "express";

export const ErrorHandler = (
    error: Error,
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
): express.Response => {
    if (error instanceof CustomError) {
        logger.instance.error(error.message);
        logger.instance.error(error.stack);
        return response
            .status(error.statusCode)
            .json({ status: false, errors: error.serialize() });
    }

    if (envconfig.env !== 'production') {
        logger.instance.error(error.message);
        logger.instance.error(error.stack);
    }
    if (envconfig.env === 'production') {
        logger.instance.error(error);
    }

    return response.status(400).json({
        status: false,
        errors: [
            {
                message: codes.SomethingWentWrong,
                code: Mate.toConstant('SomethingWentWrong')
            }
        ]
    });
}