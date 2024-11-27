import { Roles } from "@config/constants/roles";
import { OrganizationService } from "@services/organization";
import { RoleService } from "@services/role";
import { StaffService } from "@services/staff";
import { Context as CoreContext } from "@theinternetfolks/context";
import { PlatformError } from "@universe/errors";
import { NextFunction, Request, Response } from "express"

export const ScopeHandlerMiddleware = (scope: string, options?: {
    get_organization_id?: (request: Request) => string | null
}) => async (
    request: Request,
    _response: Response,
    next: NextFunction
) => {
        if (request.method.toLocaleLowerCase() === 'options') {
            return next();
        }

        const organization_id = options?.get_organization_id
            ? options.get_organization_id(request)
            : request.get('X-Org');

        if (!organization_id) {
            throw new PlatformError('ResourceNotFound', {
                resource: 'Organization'
            });
        }

        const organization = await OrganizationService.Get(organization_id);
        if (!organization) {
            throw new PlatformError('ResourceNotFound', {
                resource: 'Organization'
            });
        }

        const staff = await StaffService.hasAccess({
            organization_id
        });
        CoreContext.set({
            organization_id: organization.id,
            staff
        })
        const role_name = staff.role.name;
        if (RoleService.hasScope({ role: role_name as Roles, scope: scope })) {
            return next();
        }
        throw new PlatformError('NotAllowedAccess');
    }