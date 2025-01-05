import { UserService } from "@services/user";
import { Request, Response } from "express";

const ListUserToAddInOrganization = async (request: Request, response: Response) => {

    const {
        organization_id,
    } = request.params;

    const staffs = await UserService.ListUserToAddInOrganization(organization_id);

    return response.status(200).json({
        status: true,
        content: {
            data: staffs
        }
    })
}

export const UserController = {
    ListUserToAddInOrganization
}