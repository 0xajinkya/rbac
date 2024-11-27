import Crypto from 'crypto';
import bcrypt from 'bcrypt';

class Hash {
    static create(data: string): string {
        return Crypto.createHash('sha512').update(data).digest('hex');
    }

    static verify(hash: string, data: string): boolean {
        return Hash.create(data) === hash;
    }

    static createHmac(key: string, data: string, algorithm = 'sha256'): string {
        return Crypto.createHmac(algorithm, key).update(data).digest('hex');
    }

    static verifyHmac(
        hash: string,
        key: string,
        data: string,
        algorithm = 'sha256'
    ): boolean {
        return hash === Hash.createHmac(key, data, algorithm);
    }

    static async password(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    static async verifyPassword(
        password: string,
        hash: string
    ): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    static random(max = 16, min = 0): number {
        return Crypto.randomInt(min, max);
    }
}

export default Hash;
