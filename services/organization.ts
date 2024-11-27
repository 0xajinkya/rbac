import { IOrganization, IOrganizationCreate } from "@interfaces/identity";
import { IPrismaOptions } from "@interfaces/prisma";
import { Database } from "@universe/loaders/database";
import { AuthHelperService } from "./auth-helper";
import { helper } from "@libraries/helper";
import { StaffService } from "./staff";
import { Roles } from "@config/constants/roles";
import { response } from "express";

const Create = async (data: IOrganizationCreate, options?: IPrismaOptions) => {
    const transaction = await Database.getTransaction(options);

    const {
        name,
    } = data;

    const user = AuthHelperService.get();

    const document: IOrganization = {
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
    Create,
    Get,
    Add
}