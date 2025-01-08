import { faker } from "@faker-js/faker";
import { IError, IResponse } from "@interfaces/common";
import { IOrganization, IUser } from "@interfaces/identity";
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

beforeAll(async () => {
    await agent.Post("/v1/auth/signup", signupPayload);
})

beforeEach(async () => {
    await agent.Post("/v1/auth/signin", signupPayload);
})

describe("/v1/auth/organization", () => {
    it("should create an organization with valid details", async () => {
        const organizationPayload = {
            name: faker.company.name(),
            description: faker.lorem.sentence(),
        }
        const res = await agent.Post<IResponse<{ organization: IOrganization, staff: IStaffWithUser }>>("/v1/organization", organizationPayload);
        expect(res.data?.status).toBe(true);
        expect(res.data?.content.data.organization.name).toBe(organizationPayload.name);
        expect(res?.data?.content?.data?.staff?.user?.email).toBe(getSanitizedEmail(signupPayload.email) ?? signupPayload.email);
    });

    it("should not create an organization when not logged in", async () => {

        await agent.Post("/v1/auth/signout", {});
        const organizationPayload = {
            name: faker.company.name(),
            description: faker.lorem.sentence(),
        }
        const res = await agent.Post<IError>("/v1/organization", organizationPayload);
        expect(res.data?.status).toBe(false);
    });

    it("should create an organization and make the creator it's superadmin", async () => {
        const organizationPayload = {
            name: faker.company.name(),
            description: faker.lorem.sentence(),
        }
        const res = await agent.Post<IResponse<{ organization: IOrganization, staff: IStaffWithUser }>>("/v1/organization", organizationPayload);
        expect(res.data?.status).toBe(true);
        expect(res.data?.content?.data?.staff?.role_id).toBe("super_admin");
    })

    it("should create an organization and set the creator active organization to a valid value", async () => {
        const organizationPayload = {
            name: faker.company.name(),
            description: faker.lorem.sentence(),
        }
        const res = await agent.Post<IResponse<{ organization: IOrganization, staff: IStaffWithUser }>>("/v1/organization", organizationPayload);

        expect(res.data?.status).toBe(true);
        const me = await agent.Get<IResponse<IUser>>("/v1/auth/me");
        expect(me.data?.content.data.active_organization_id).toBe(res?.data?.content.data.organization.id as string);
    });
})