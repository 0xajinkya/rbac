import { Mandatory } from "@interfaces/common";
import { organization, Prisma } from "@prisma/client";
import { IStaff } from "./staff";
import { IRole } from "./role";
import { IUser } from "./user";

export type IOrganization = organization;

export type IOrganizationInput = Omit<Mandatory<IOrganization, "name">, "id" | "created_at" | "updated_at" | "created_by_id" | "deleted">;

export type IOrganizationCreate = Omit<Mandatory<IOrganization, "name" | "created_at" | "updated_at" | "created_by_id" | "id">, "deleted">;

export type IOrganizationUpdate = Partial<IOrganizationInput> & { deleted?: boolean };

export type IOrganizationWithoutOptionalFields = Omit<
  IOrganization,
  'created_at' | 'updated_at'
>

export type IOrganizationWithUserStaffAndRole = IOrganization & {
  staff: IStaff & {
    user: IUser | null
    role: IRole | null;
  };
}