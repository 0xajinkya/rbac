import { AllRoleList, Roles } from "@config/constants/roles";
import { RoleService } from "./role";
import { UserService } from "./user";
import { IPrismaOptions } from "@interfaces/prisma";
import { PlatformError } from "@universe/errors";
import { OrganizationService } from "./organization";
import { helper } from "@libraries/helper";
import { IStaff, IStaffCreate } from "@interfaces/identity/staff";
import { Database } from "@universe/loaders/database";
import { AuthHelperService } from "./auth-helper";

const Get = async (id: string, options?: IPrismaOptions) => {
    const transaction = await Database.getTransaction(options);
    const result = await transaction.staff.findFirst({
        where: {
            id
        }
    });
    return result;
}

const Add = async ({ userId, roleId, organizationId }: { userId: string, roleId: Roles, organizationId: string }, options?: IPrismaOptions) => {
    if (!AllRoleList.includes(roleId)) {
        throw new PlatformError("ResourceNotFound", {
            resource: "Role",
            value: roleId
        })
    };
    const role = await RoleService.Get(roleId, options);
    if (!role) {
        throw new PlatformError("ResourceNotFound", {
            resource: "Role",
            value: roleId
        })
    }
    const user = await UserService.Get(userId, options);
    if (!user) {
        throw new PlatformError("ResourceNotFound", {
            resource: "User",
            value: userId
        })
    }
    const organization = await OrganizationService.Get(organizationId, options);
    if (!organization) {
        throw new PlatformError("ResourceNotFound", {
            resource: "Organization",
            value: organizationId
        })
    }

    const transaction = await Database.getTransaction(options);

    // const staffExists = await StaffService.Get(user.id, organization.id, role.id, options);
    const staffExists = await transaction.staff.findFirst({
        where: {
            user_id: user.id,
            organization_id: organization.id,
        }
    });

    if (staffExists) {
        throw new PlatformError("ResourceExists", {
            resource: "Staff",
        })
    }

    const document: IStaffCreate = {
        id: helper.getId(),
        user_id: user.id,
        organization_id: organization.id,
        role_id: role.id,
        created_at: new Date(),
        updated_at: new Date()
    };
    const staff = await transaction.staff.create({
        data: document
    });
    return staff;
};

const hasAccess = async ({
    organization_id,
}: {
    organization_id: string,
    scope?: string
}, options?: IPrismaOptions) => {
    const user = AuthHelperService.get();
    const transaction = await Database.getTransaction(options);
    const result = await transaction.staff.findFirst({
        where: {
            organization_id,
            user_id: user.id
        },
        include: {
            role: true
        }
    });
    if (!result) {
        throw new PlatformError("NotAllowedAccess");
    }
    return result;
}

export const StaffService = {
    Add,
    hasAccess,
    Get
}