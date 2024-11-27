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
    Get,
    hasScope
}