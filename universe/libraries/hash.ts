import bcrypt from 'bcrypt';

/**
 * Utility class for various hashing and encryption tasks.
 * 
 * @class Hash
 */
class Hash {

    /**
     * Hashes a password using bcrypt.
     * 
     * @static
     * @async
     * @function password
     * @param {string} password - The password to hash.
     * 
     * @returns {Promise<string>} - The hashed password.
     */
    static async password(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    /**
     * Verifies if a password matches the provided bcrypt hash.
     * 
     * @static
     * @async
     * @function verifyPassword
     * @param {string} password - The original password.
     * @param {string} hash - The bcrypt hash to compare against.
     * 
     * @returns {Promise<boolean>} - `true` if the password matches the hash, otherwise `false`.
     */

    static async verifyPassword(
        password: string,
        hash: string
    ): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}

export default Hash;
