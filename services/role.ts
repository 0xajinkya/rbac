import { permissions } from "@config/constants";
import { AllRoleList, Roles } from "@config/constants/roles";
import { IPrismaOptions } from "@interfaces/prisma";
import { Database } from "@universe/loaders/database";

const Get = async (role: Roles, options?: IPrismaOptions) => {

    const transaction = await Database.getTransaction(options);
    const dbRole = await transaction.role.findUnique({
        where: {
            id: role
        }
    });
    return dbRole;
};

const hasScope = ({ role, scope }: { role: any, scope: string }) => {
    if (!AllRoleList.includes(role)) {
        return false;
    }
    if (Object.keys(permissions).includes(role)) {
        const [module] = scope.split(':');
        if (
            permissions[role].includes(scope) ||
            permissions[role].includes(`${module}:all`) ||
            permissions[role].includes('*')
        ) {
            return true;
        }
    }
    return false;
}

export const RoleService = {
    /**
     * Retrieves a role from the database by its ID.
     * 
     * @function Get
     * @async
     * @param {Roles} role - The role ID to fetch.
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<Role | null>} - The role object or null if not found.
     * 
     * @throws {PlatformError} - Throws an error if the role retrieval fails.
    */
    Get,
    /**
     * Checks if a role has the required scope (permission).
     * 
     * @function hasScope
     * @param {Object} params - The parameters for permission checking.
     * @param {any} params.role - The role for which to check permission.
     * @param {string} params.scope - The scope (permission) to check.
     * @returns {boolean} - Returns true if the role has permission for the scope, otherwise false.
    */
    hasScope
}