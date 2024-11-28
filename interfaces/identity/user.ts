export interface IUser {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
    active_organization_id: string | null;
}

export interface IUserWithoutPassword {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
    created_at: Date;
    updated_at: Date;
    active_organization_id: string | null;
}

export type IUserUpdate = Omit<Partial<IUser>, "id" | "email">;

export interface IUserCreate extends IUserUpdate {
    email: string;
    password: string;
};

export interface ITokens {
    access_token: string;
    refresh_token: string;
};

export type IUserWithoutOptionalField = Omit<IUser, "active_organization_id" | "last_name" | "created_at" | "updated_at" & Partial<Pick<IUser, "active_organization_id" | "last_name" | "created_at" | "updated_at">>>;