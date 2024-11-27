import { envconfig } from "./envconfig";
import jwt, {
    type Algorithm,
    type JwtPayload,
    type SignOptions,
    type VerifyOptions
} from 'jsonwebtoken';

const create = <T extends { [key: string]: unknown }>(content: T, options?: SignOptions): string => {
    const private_key =
        envconfig.env !== 'production'
            ? envconfig.authentication.jwt.private_key
            : envconfig.authentication.jwt.private_key.replace(/\\n/g, '\n');
    return jwt.sign({ content }, private_key, {
        algorithm: envconfig.authentication.jwt.algorithm as Algorithm,
        ...options
    });
}

const verify = (token: string, options?: VerifyOptions): JwtPayload | string => {
    const public_key =
        envconfig.env !== 'production'
            ? envconfig.authentication.jwt.public_key
            : envconfig.authentication.jwt.public_key.replace(/\\n/g, '\n');
    return jwt.verify(token, public_key, {
        algorithms: [envconfig.authentication.jwt.algorithm],
        ...options
    });
}

export const Jwt = {
    create,
    verify
}