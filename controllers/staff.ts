import { OrganizationService } from "@services/organization";
import { StaffService } from "@services/staff";
import { Database } from "@universe/loaders/database";
import { Request, Response } from "express";

const Add = async (request: Request, response: Response) => {
    const {
        organization_id,
        user_id,
        role_id
    } = request.body;

    const transaction = await Database.getTransaction();

    //TODO: add curent user's role to context and check if the role_id is super_admin and the role set in context is not super_admin i.e. only super_admin should be able to add super_admin

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
    Add
}