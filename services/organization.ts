import { IOrganization, IOrganizationCreate, IOrganizationInput } from "@interfaces/identity";
import { IPrismaOptions } from "@interfaces/prisma";
import { Database } from "@universe/loaders/database";
import { AuthHelperService } from "./auth-helper";
import { helper } from "@libraries/helper";
import { StaffService } from "./staff";
import { Roles } from "@config/constants/roles";


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
    Add
}