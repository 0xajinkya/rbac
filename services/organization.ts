import { IOrganization, IOrganizationCreate, IOrganizationInput } from "@interfaces/identity";
import { IPrismaOptions } from "@interfaces/prisma";
import { Database } from "@universe/loaders/database";
import { AuthHelperService } from "./auth-helper";
import { helper } from "@libraries/helper";
import { StaffService } from "./staff";
import { Roles } from "@config/constants/roles";
import { PlatformError } from "@universe/errors";
import { UserService } from "./user";
import { OrganizationSchema } from "@schema/organization";


const Create = async (data: IOrganizationInput, options?: IPrismaOptions) => {
    const transaction = await Database.getTransaction(options);

    const {
        name,
    } = data;

    const user = AuthHelperService.get();

    const document: IOrganizationCreate = {
        id: helper.getId(),
        name,
        created_at: new Date(),
        updated_at: new Date(),
        created_by_id: user.id,
    };

    helper.isValidSchema(document, OrganizationSchema);

    const result = await transaction.organization.create({
        data: document
    });
    return result;
};

const Get = async (identifier: string, options?: IPrismaOptions) => {
    const transaction = await Database.getTransaction(options);
    const response = await transaction.organization.findFirst({
        where: {
            id: identifier
        }
    });
    return response;
}

const Add = async ({ organizationId, userId, roleId }: {
    organizationId: string;
    userId: string;
    roleId: Roles;
}, options?: IPrismaOptions) => {
    const staffUser = await StaffService.Add({ userId, roleId, organizationId }, options);
    return staffUser;
}

const GetMemberOrganizations = async (userId: string, options?: IPrismaOptions) => {
    const transaction = await Database.getTransaction(options);
    const response = await transaction.organization.findMany({
        where: {
            staff: {
                some: {
                    user_id: userId
                }
            }
        },
        include: {
            staff: {
                where: {
                    user_id: userId,
                }
            }
        }
    });
    console.log(response);
    return response;
}

const Login = async (organization_id: string, user_id: string, options?: IPrismaOptions) => {
    const transaction = await Database.getTransaction(options);
    const neededOrganization = await transaction.organization.findFirst({
        where: {
            id: organization_id,
            staff: {
                some: {
                    user_id: user_id
                }
            }
        },
        include: {
            staff: {
                include: {
                    role: true,
                    user: true
                }
            },
        }
    });
    if (!neededOrganization) {
        throw new PlatformError("NotAllowedAccess");
    }
    await UserService.Update(user_id, {
        active_organization_id: organization_id
    })

    return neededOrganization;
}

export const OrganizationService = {
    /**
     * Creates a new organization.
     * 
     * @function Create
     * @async
     * @param {IOrganizationInput} data - The input data for the organization (e.g., name).
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<Organization>} - The created organization.
     * 
     * @throws {PlatformError} - Throws an error if creation fails.
    */
    Create,
    /**
     * Retrieves an organization by its ID.
     * 
     * @function Get
     * @async
     * @param {string} identifier - The organization ID.
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<Organization | null>} - The organization details or null if not found.
     * 
     * @throws {PlatformError} - Throws an error if retrieval fails.
    */
    Get,
    /**
    * Adds a user to an organization with a specific role.
    * 
    * @function Add
    * @async
    * @param {Object} data - The data for adding a user to an organization.
    * @param {string} data.organizationId - The organization ID.
    * @param {string} data.userId - The user ID to be added.
    * @param {Roles} data.roleId - The role to be assigned to the user.
    * @param {IPrismaOptions} options - Optional Prisma transaction options.
    * @returns {Promise<StaffUser>} - The staff user added to the organization.
    * 
    * @throws {PlatformError} - Throws an error if addition fails.
    */
    Add,
    /**
     * Retrieves a list of organizations where the specified user is a member.
     * 
     * @function GetMemberOrganizations
     * @async
     * @param {string} userId - The ID of the user whose organizations are to be fetched.
     * @param {IPrismaOptions} [options] - Optional configuration for the Prisma query.
     * @returns {Promise<Array>} - A promise that resolves to an array of organizations the user is a member of.
     * 
     * @throws {PlatformError} - Throws an error if the query fails or if the transaction encounters an issue.
     */
    GetMemberOrganizations,
    /**
     * Logs a user into the specified organization by verifying their membership and setting the active organization.
     * 
     * @function Login
     * @async
     * @param {string} organization_id - The ID of the organization the user is attempting to log into.
     * @param {string} user_id - The ID of the user who is logging in.
     * @param {IPrismaOptions} [options] - Optional configuration for the Prisma transaction.
     * @returns {Promise<IOrganization>} - A promise that resolves to the organization the user is logging into.
     * 
     * @throws {PlatformError} - Throws a PlatformError with the message "NotAllowedAccess" if the user does not belong to the organization.
     */
    Login
}