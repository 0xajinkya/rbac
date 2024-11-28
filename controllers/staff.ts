import { AllRoleList, RoleNameFromKey } from "@config/constants/roles";
import { IStaff } from "@interfaces/identity/staff";
import { OrganizationService } from "@services/organization";
import { StaffService } from "@services/staff";
import { Context as CoreContext } from "@theinternetfolks/context";
import { PlatformError } from "@universe/errors";
import { Database } from "@universe/loaders/database";
import { Request, Response } from "express";

const Add = async (request: Request, response: Response) => {
    const {
        user_id,
        role_id
    } = request.body;
    const { organization_id, staff } = CoreContext.get<{
        organization_id: string;
        staff: IStaff & {
            role: {
                name: string,
                id: string
            }
        }
    }>();

    if (role_id === RoleNameFromKey["super_admin"] || role_id === RoleNameFromKey["admin"]) {
        if (staff.role.name !== RoleNameFromKey["super_admin"]) {
            throw new PlatformError("NotAllowedAccess", {
                message: `Only super_admin can add ${role_id}`
            })
        }
    }

    const transaction = await Database.getTransaction();

    const res = await StaffService.Add({
        organizationId: organization_id,
        userId: user_id,
        roleId: role_id
    }, {
        transaction
    })

    return response.status(201).json({
        status: true,
        content: {
            data: res
        }
    })
}

export const StaffController = {
    /**
     * Adds a staff member with a specified role to an organization.
     * 
     * @param {Request} request - The HTTP request containing the user ID and role ID in the body.
     * @param {Response} response - The HTTP response object where the result is sent.
     * @returns {Response} - The response with status and staff member data.
     */
    Add
}