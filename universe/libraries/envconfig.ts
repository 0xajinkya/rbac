import type { Algorithm } from 'jsonwebtoken';
import rawconfig from 'node_modules/config';

export interface EnvConfig {
    name: string;
    project: string;
    env: "development" | "production" | "test";
    port: number;
    database: {
        postgres: {
            host: string;
            database: string;
            username: string;
            password: string;
            url: string;
        }
    },
    // services: {}, //To store env variable for any third party services, if used any in this project
    authentication: {
        domain: string;
        cookie: {
            sameSite: "strict" | "lax" | "none";
            secret: string;
            ssl: string;
        },
        jwt: {
            algorithm: Algorithm;
            private_key: string;
            public_key: string;
            expires_in: string;
            refresh_expires_in: string;
        }
    }
}

export const envconfig = rawconfig as unknown as EnvConfig;