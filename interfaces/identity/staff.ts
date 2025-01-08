import { staff } from "@prisma/client";
import { IUser } from "./user";

export type IStaff = staff;

export type IStaffInput = Omit<IStaff, 'id' | "created_at" | "updated_at" | "deleted">;

export type IStaffCreate = Omit<staff, "deleted">;

export type IStaffWithoutOptionalFields = Omit<
    IStaff,
    'created_at' | 'updated_at'
>;

export type IStaffUpdate = Pick<staff, "role_id">;

export type IStaffWithUser = IStaff & {
    user: IUser | null
}