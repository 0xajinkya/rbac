import winston from "winston";
import { envconfig } from "./envconfig";

const truncateLogFormat = winston.format((info: winston.Logform.TransformableInfo) => {
    const maxSize = 256 * 1024; // 256KB
    const logSize = Buffer.byteLength(JSON.stringify(info), 'utf8');
    if (logSize > maxSize) {
        info.message = (info.message as string).slice(0, maxSize - 100) + '... [truncated]';
    }

    return info;
});

export class logger {
    static instance: winston.Logger | Console;

    static Loader = () => {
        const loggerFormat = winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.metadata(),
            winston.format.timestamp(),
            truncateLogFormat(),
            winston.format.json()
        );

        const transports: winston.transport[] = [
            new winston.transports.Console({
                level: 'debug'
            })
        ];

        if (envconfig.env === 'test') {
            transports.push(
                new winston.transports.File({
                    filename: 'logfile.test.log'
                })
            );
        }

        logger.instance =
            envconfig.env === 'development'
                ? console
                : winston.createLogger({
                    level: 'info',
                    transports,
                    format: loggerFormat
                });


    }
}