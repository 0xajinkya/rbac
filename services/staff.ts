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
import { Prisma } from "@prisma/client";
import { ContextService } from "./context";

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
        data: document,
        include: {
            user: true
        }
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

const List = async ({
    where = {},
    include = {},
    order = {},
    limit = 10,
    skip = 0
}: {
    where?: Prisma.staffWhereInput,
    include?: Prisma.staffInclude,
    order?: Prisma.staffOrderByWithAggregationInput,
    limit?: number,
    skip?: number
}, options?: IPrismaOptions) => {
    const transaction = await Database.getTransaction(options);
    const response = await transaction.staff.findMany({
        where: {
            ...where,
        },
        skip: skip < 0 ? 0 : skip,
        take: limit < 0 ? 10 : limit,
        orderBy: order,
        include
    });
    return response;
}

const Delete = async (identifier: string, options?: IPrismaOptions) => {
    const staff = await Get(identifier, options);
    if (!staff) {
        throw new PlatformError("ResourceNotFound", {
            resource: "Staff",
        })
    }
    const transaction = await Database.getTransaction(options);
    const response = await transaction.staff.update({
        where: {
            id: identifier
        },
        data: {
            deleted: true
        }
    });
    return response;
};

const GetMe = async (options?: IPrismaOptions) => {
    const transaction = await Database.getTransaction(options);
    const organization_id = ContextService.GetSession().active_organization_id;

    if (!organization_id) {
        throw new PlatformError("NotAllowedAccess");
    }
    const staff = await transaction.staff.findFirst({
        where: {
            organization_id: organization_id
        },
        include: {
            role: true,
            organization: true,
            user: true
        }
    });

    if (!staff) {
        throw new PlatformError("ResourceNotFound", {
            resource: "Staff",
        })
    }
    return staff;
}

export const StaffService = {
    /**
     * Adds a user to an organization with a specific role.
     * 
     * @param {Object} params - The parameters for adding staff.
     * @param {string} params.userId - The user ID to be added as staff.
     * @param {Roles} params.roleId - The role ID for the staff member.
     * @param {string} params.organizationId - The organization ID to which the staff member will belong.
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<IStaff>} - The newly created staff record.
     * 
     * @throws {PlatformError} - Throws an error if the role, user, or organization is not found, or if the staff member already exists.
    */
    Add,
    /**
     * Checks if the authenticated user has access to the specified organization.
     * 
     * @param {Object} params - The parameters for checking access.
     * @param {string} params.organization_id - The organization ID to check access for.
     * @param {string} [params.scope] - Optional scope for further permission validation.
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<IStaff>} - The staff record with the associated role and access details.
     * 
     * @throws {PlatformError} - Throws an error if the user is not found or does not have access.
    */
    hasAccess,
    /**
     * Retrieves a staff member's details by their ID.
     * 
     * @param {string} id - The ID of the staff member to fetch.
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<IStaff | null>} - The staff member details or null if not found.
    */
    Get,
    List,
    Delete,
    GetMe
}