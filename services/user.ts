import type { IUserCreate, IUserUpdate } from "@interfaces/identity"
import type { IPrismaOptions } from "@interfaces/prisma"
import Hash from "@libraries/hash";
import { helper } from "@libraries/helper";
import { PlatformError, SchemaValidationError } from "@universe/errors";
import { Database } from "@universe/loaders/database";
import { Rules } from "validatorjs";

const UserSchema: Rules = {
    id: ["string", "required"],
    first_name: ["string"],
    last_name: ["string"],
    email: ["string", "required"],
    password: ["string", "required"],
    created_at: ['date'],
    updated_at: ['date']
}

const Create = async (data: IUserCreate, options?: IPrismaOptions) => {
    const {
        first_name,
        last_name,
        password,
        created_at = new Date(),
        updated_at = new Date()
    } = data;

    let {
        email
    } = data;

    const sanitizedEmail = helper.getSanitizedEmail(email);

    if (!sanitizedEmail) {
        throw new SchemaValidationError([
            {
                message: 'Email address is invalid.',
                param: "email"
            }
        ]);
    }
    email = sanitizedEmail;

    const existingUser = await Get(email, options);

    if (existingUser) {
        throw new PlatformError("ResourceExists", {
            resource: "Email address"
        });
    }

    const document = {
        id: helper.getId(),
        first_name,
        last_name,
        email,
        password
    };
    helper.isValidSchema(document, UserSchema);

    document.password = await Hash.password(password);

    const newUser = await (await Database.getTransaction(options)).user.create({
        data: document
    });

    return newUser;
}

const Get = async (identifier: string, options?: IPrismaOptions) => {
    const transaction = await Database.getTransaction(options);
    const response = await transaction.user.findFirst({
        where: {
            OR: [
                {
                    id: identifier
                },
                {
                    email: identifier
                }
            ]
        }
    });
    return response;
}

const Update = async (id: string, data: IUserUpdate, options?: IPrismaOptions) => {
    const userExists = await Get(id, options);
    if (!userExists) {
        throw new PlatformError("ResourceNotFound", {
            resource: "User",
        })
    }
    const transaction = await Database.getTransaction(options);
    const {
        first_name,
        last_name,
        password,
        active_organization_id
    } = data;
    const document: IUserUpdate = {};

    if (typeof first_name !== "undefined") {
        document.first_name = first_name;
    }

    if (typeof last_name !== "undefined") {
        document.last_name = last_name;
    }

    if (typeof password !== "undefined") {
        document.password = await Hash.password(password);
    }

    if (typeof active_organization_id !== "undefined") {
        document.active_organization_id = active_organization_id;
    }

    const updatedUser = await transaction.user.update({
        where: {
            id: id
        },
        data: document
    });

    return updatedUser;
}

export const UserService = {
    Create,
    Get,
    Update
}