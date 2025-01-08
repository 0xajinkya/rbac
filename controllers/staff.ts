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
    let { organization_id, staff } = CoreContext.get<{
        organization_id: string;
        staff: IStaff & {
            role: {
                name: string,
                id: string
            }
        }
    }>();

    if(!organization_id){
        organization_id = request.body.organization_id;
    }

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

export const List = async (request: Request, response: Response) => {
    const {
        where,
        include,
        order,
        limit,
        skip
    } = request.body;

    const staff = await StaffService.List({
        where,
        include,
        order,
        limit,
        skip
    });

    return response.status(200).json({
        status: true,
        content: {
            data: staff
        }
    })
}

export const Delete = async (request: Request, response: Response) => {
    const {
        id
    } = request.params;
    const transaction = await Database.getTransaction();
    const staff = await StaffService.Delete(id, {
        transaction
    })
    return response.status(201).json({
        status: true,
        content: {
            data: staff
        }
    })
}

export const GetMe = async (request: Request, response: Response) => {
    const transaction = await Database.getTransaction();
    const staff = await StaffService.GetMe({
        transaction
    })
    return response.status(201).json({
        status: true,
        content: {
            data: staff
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
    Add,
    List,
    Delete,
    GetMe
}