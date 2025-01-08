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
import { StaffSchema } from "@schema/organization";

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
    let organization = await OrganizationService.Get(organizationId, options);
    if (!organization) {
        if (user?.active_organization_id) {
            organization = await OrganizationService.Get(user.active_organization_id, options);
            if (!organization) {
                throw new PlatformError("ResourceNotFound", {
                    resource: "Organization",
                    value: user.active_organization_id
                })
            }
        }
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

    helper.isValidSchema(document, StaffSchema);

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
    /**
     * Retrieves a list of staff members based on the provided query parameters.
     * 
     * @function List
     * @async
     * @param {Object} params - The query parameters for filtering and pagination.
     * @param {Prisma.staffWhereInput} [params.where] - Optional filter criteria for the staff records.
     * @param {Prisma.staffInclude} [params.include] - Optional related data to include in the query.
     * @param {Prisma.staffOrderByWithAggregationInput} [params.order] - Optional sorting order for the results.
     * @param {number} [params.limit=10] - The number of staff records to retrieve.
     * @param {number} [params.skip=0] - The number of staff records to skip (for pagination).
     * @param {IPrismaOptions} [options] - Optional configuration for the Prisma query.
     * @returns {Promise<Array>} - A promise that resolves to an array of staff records.
     */
    List,
    /**
     * Deletes a staff member by marking them as deleted.
     * 
     * @function Delete
     * @async
     * @param {string} identifier - The ID of the staff member to delete.
     * @param {IPrismaOptions} [options] - Optional configuration for the Prisma query.
     * @returns {Promise<Object>} - A promise that resolves to the updated staff record after being marked as deleted.
     * 
     * @throws {PlatformError} - Throws a PlatformError if the staff member is not found.
     */
    Delete,
    /**
     * Retrieves the staff member associated with the current session and active organization.
     * 
     * @function GetMe
     * @async
     * @param {IPrismaOptions} [options] - Optional configuration for the Prisma query.
     * @returns {Promise<Object>} - A promise that resolves to the staff record associated with the current session's organization.
     * 
     * @throws {PlatformError} - Throws a PlatformError with the message "NotAllowedAccess" if the active organization is not set in the session.
     * @throws {PlatformError} - Throws a PlatformError with the message "ResourceNotFound" if the staff member is not found in the organization.
     */
    GetMe
}