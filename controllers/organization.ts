import { RoleNameFromKey } from "@config/constants/roles";
import { AuthService } from "@services/auth";
import { OrganizationService } from "@services/organization";
import { StaffService } from "@services/staff";
import { UserService } from "@services/user";
import { Database } from "@universe/loaders/database";
import { Request, Response } from "express";

const Create = async (request: Request, response: Response) => {
    const {
        name
    } = request.body;

    const transaction = await Database.getTransaction();
    const organization = await OrganizationService.Create({
        name
    }, {
        transaction
    })
    await StaffService.Add({
        userId: organization.created_by_id,
        roleId: RoleNameFromKey.super_admin,
        organizationId: organization.id
    }, {
        transaction
    });
    const updatedUser = await UserService.Update(organization.created_by_id, {
        active_organization_id: organization.id
    });
    const tokens = await AuthService.createToken(updatedUser);
    response = await AuthService.createCookie(response, tokens);

    return response.status(201).json({
        status: true,
        content: {
            data: organization
        }
    });
}



export const OrganizationController = {
    /**
     * Creates a new organization and adds the super admin user, updates their active organization, and generates authentication tokens.
     * 
     * @param {Request} request - The HTTP request containing the organization name in the body.
     * @param {Response} response - The HTTP response object where the result is sent.
     * @returns {Response} - The response with the status and organization data.
    */
    Create,
}