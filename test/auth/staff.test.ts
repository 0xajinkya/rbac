import { faker } from "@faker-js/faker";
import { IError, IResponse } from "@interfaces/common";
import { IOrganization, IOrganizationWithUserStaffAndRole, IUser, IUserWithoutPassword } from "@interfaces/identity";
import { IStaff, IStaffWithUser } from "@interfaces/identity/staff";
import { getSanitizedEmail } from "@libraries/helper";
import { agent } from "@libraries/test-utils/agent";
import { beforeAll, beforeEach, describe, expect, it } from "bun:test";

const signupPayload = {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    password: "Password@123",
}

let organizationPayload = {
    id: faker.database.mongodbObjectId(),
    name: faker.lorem.word({ length: 10 }),
    description: faker.lorem.sentence()
}

let userStaff: IStaffWithUser | null | undefined;

beforeAll(async () => {
    await agent.Post("/v1/auth/signup", signupPayload);
});

beforeEach(async () => {
    await agent.Post("/v1/auth/signin", signupPayload);
    const res = await agent.Post<IResponse<{ organization: IOrganization, staff: IStaffWithUser }>>("/v1/organization", organizationPayload);
    organizationPayload.id = res.data?.content.data.organization.id ?? "";
    userStaff = res.data?.content.data.staff;
});

describe("Organization & Staff E2E Test", () => {
    it("should return current user as super_admin of the organization and creator user's valid active organization", async () => {
        expect(userStaff?.role_id).toBe("super_admin");
        expect(userStaff?.user?.email).toBe(getSanitizedEmail(signupPayload.email) ?? signupPayload.email);
        const me = await agent.Get<IResponse<IUser>>("/v1/auth/me");
        expect(me.data?.content.data.active_organization_id).toBe(organizationPayload.id as string);
    });

    it("should login user to the organization", async () => {
        const loginRes = await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});
        expect(loginRes.data?.status).toBe(true);
    })

    it("should add user as editor to the organization", async () => {
        const userPayload = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: "Password@123",
        };
        const signupRes = await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signup", userPayload);
        expect(signupRes.data?.data?.email).toBe(getSanitizedEmail(userPayload.email) ?? userPayload.email);

        await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signin", signupPayload);
        await agent.Post<IResponse<IOrganizationWithUserStaffAndRole>>(`/v1/organization/${organizationPayload.id}/login`, {})

        const addUserToStaffRes = await agent.Post<IResponse<IStaffWithUser>>("/v1/staff", {
            user_id: signupRes.data?.data.id,
            role_id: "editor",
            organization_id: organizationPayload.id
        }, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(addUserToStaffRes.data?.status).toBe(true);
        expect(addUserToStaffRes?.data?.content?.data?.role_id).toBe("editor");
    });

    it("should add user as admin to the organization", async () => {
        const userPayload = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: "Password@123",
        };
        const signupRes = await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signup", userPayload);
        expect(signupRes.data?.data?.email).toBe(getSanitizedEmail(userPayload.email) ?? userPayload.email);

        await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signin", signupPayload);
        await agent.Post<IResponse<IOrganizationWithUserStaffAndRole>>(`/v1/organization/${organizationPayload.id}/login`, {})

        const addUserToStaffRes = await agent.Post<IResponse<IStaffWithUser>>("/v1/staff", {
            user_id: signupRes.data?.data.id,
            role_id: "admin",
            organization_id: organizationPayload.id
        }, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(addUserToStaffRes.data?.status).toBe(true);
        expect(addUserToStaffRes?.data?.content?.data?.role_id).toBe("admin");
    });

    it("should add user as reviewer to the organization", async () => {
        const userPayload = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: "Password@123",
        };
        const signupRes = await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signup", userPayload);
        expect(signupRes.data?.data?.email).toBe(getSanitizedEmail(userPayload.email) ?? userPayload.email);

        await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signin", signupPayload);
        await agent.Post<IResponse<IOrganizationWithUserStaffAndRole>>(`/v1/organization/${organizationPayload.id}/login`, {})

        const addUserToStaffRes = await agent.Post<IResponse<IStaffWithUser>>("/v1/staff", {
            user_id: signupRes.data?.data.id,
            role_id: "reviewer",
            organization_id: organizationPayload.id
        }, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(addUserToStaffRes.data?.status).toBe(true);
        expect(addUserToStaffRes?.data?.content?.data?.role_id).toBe("reviewer");
    });

    it("should not add user to the organization when the user is an editor", async () => {
        const userPayload = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: "Password@123",
        };
        const signupRes = await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signup", userPayload);
        expect(signupRes.data?.data?.email).toBe(getSanitizedEmail(userPayload.email) ?? userPayload.email);

        await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signin", signupPayload);
        await agent.Post<IResponse<IOrganizationWithUserStaffAndRole>>(`/v1/organization/${organizationPayload.id}/login`, {})

        const addUserToStaffRes = await agent.Post<IResponse<IStaffWithUser>>("/v1/staff", {
            user_id: signupRes.data?.data.id,
            role_id: "editor",
            organization_id: organizationPayload.id
        }, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });

        const anotherUserPayload = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: "Password@123",
        }

        await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signup", anotherUserPayload);

        await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signin", userPayload);
        await agent.Post<IResponse<IOrganizationWithUserStaffAndRole>>(`/v1/organization/${organizationPayload.id}/login`, {})

        const addAnotherUserToStaffRes = await agent.Post<IError>("/v1/staff", {
            user_id: userPayload.email,
            role_id: "editor",
            organization_id: organizationPayload.id
        }, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });

        expect(addAnotherUserToStaffRes.data?.status).toBe(false);
    });
})