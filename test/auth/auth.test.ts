import { beforeEach, describe, expect, it } from "bun:test";
import { faker } from '@faker-js/faker';
import { agent } from "@libraries/test-utils/agent";
import { IError, IResponse } from "@interfaces/common";
import { IUserWithoutPassword } from "@interfaces/identity";
import { getSanitizedEmail } from "@libraries/helper";

describe("/v1/auth/signup", () => {
    it("should signup a user with correct details", async () => {
        const signupPayload = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: "Password@123",
        }
        const res = await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signup", signupPayload);
        expect(res.data?.data.first_name).toBe(signupPayload.first_name);
        expect(res.data?.data.last_name).toBe(signupPayload.last_name);
        expect(res.data?.data.email).toBe(getSanitizedEmail(signupPayload.email) ?? signupPayload.email);
        expect(res.data?.data.active_organization_id).toBeNull();
    });

    it("should signup a user with only email and password as well", async () => {
        const signupPayload = {
            email: faker.internet.email(),
            password: "Password@123",
        }
        const res = await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signup", signupPayload);
        expect(res.data?.data.email).toBe(getSanitizedEmail(signupPayload.email) ?? signupPayload.email);
    });

    it("should not signup a user with in-correct details", async () => {
        const signupPayload = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.username(),
            password: faker.internet.password(),
        }
        const res = await agent.Post<IError>("/v1/auth/signup", signupPayload);
        expect(res.data?.status).toBe(false);
    });

    it("should not signup with an invalid email format", async () => {
        const signupPayload = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: "invalid-email",
            password: "Password@123",
        };
        const res = await agent.Post<IError>("/v1/auth/signup", signupPayload);
        expect(res.data?.status).toBe(false);
    });

    it("should not signup with a weak password", async () => {
        const signupPayload = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: "password",
        };
        const res = await agent.Post<IError>("/v1/auth/signup", signupPayload);
        expect(res.data?.status).toBe(false);
    });

    it("should not signup with an existing email", async () => {
        const existingEmail = faker.internet.email();
        const signupPayload1 = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: existingEmail,
            password: "Password@123",
        };
        await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signup", signupPayload1);

        const signupPayload2 = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: existingEmail,
            password: "Password@123",
        };
        const res = await agent.Post<IError>("/v1/auth/signup", signupPayload2);
        expect(res.data?.status).toBe(false);
    });

    it("should not signup without a password", async () => {
        const signupPayload = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
        };
        const res = await agent.Post<IError>("/v1/auth/signup", signupPayload);
        expect(res.data?.status).toBe(false);
    });

    it("should not signup without an email", async () => {
        const signupPayload = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            password: "Password@123",
        };
        const res = await agent.Post<IError>("/v1/auth/signup", signupPayload);
        expect(res.data?.status).toBe(false);
    });


});