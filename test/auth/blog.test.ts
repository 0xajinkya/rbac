import { faker } from "@faker-js/faker";
import { IBlog, IBlogCommentWithCreatedByUserAndBlog, IBlogReviewWithCreatedByUserAndBlog, IBlogWithCreatedByStaffAndOrg } from "@interfaces/blog";
import { IError, IResponse } from "@interfaces/common";
import { IOrganization, IUserWithoutPassword } from "@interfaces/identity";
import { IStaffWithUser } from "@interfaces/identity/staff";
import { agent } from "@libraries/test-utils/agent";
import { beforeAll, beforeEach, describe, expect, it } from "bun:test";

const superAdminUserPayload = {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    password: "Password@123",
};

let superAdminStaff: IStaffWithUser | null | undefined;

const adminUserPayload = {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    password: "Password@123",
};

let adminStaff: IStaffWithUser | null | undefined;

const editorUserPayload = {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    password: "Password@123",
};

let editorStaff: IStaffWithUser | null | undefined;

const reviewerUserPayload = {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    password: "Password@123",
};

let reviewerStaff: IStaffWithUser | null | undefined;

const normalUserPayload = {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    password: "Password@123",
};



let organizationPayload = {
    id: faker.database.mongodbObjectId(),
    name: faker.lorem.word({ length: 10 }),
    description: faker.lorem.sentence()
};

const blogForPublish = {
    id: faker.database.mongodbObjectId(),
    title: faker.lorem.word(),
    content: faker.lorem.sentence(),
}

beforeAll(async () => {
    const normalUser = await agent.Post("/v1/auth/signup", normalUserPayload);
    const adminUser = await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signup", adminUserPayload);
    const editorUser = await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signup", editorUserPayload);
    const reviewerUser = await agent.Post<IResponse<IUserWithoutPassword>["content"]>("/v1/auth/signup", reviewerUserPayload);
    await agent.Post("/v1/auth/signup", superAdminUserPayload);


    const res = await agent.Post<IResponse<{ organization: IOrganization, staff: IStaffWithUser }>>("/v1/organization", organizationPayload);
    organizationPayload.id = res.data?.content.data.organization.id ?? "";
    superAdminStaff = res.data?.content.data.staff;
    await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});

    const addAdminToStaff = await agent.Post<IResponse<IStaffWithUser>>("/v1/staff", {
        user_id: adminUser.data?.data.id,
        role_id: "admin",
        organization_id: organizationPayload.id
    }, {
        headers: {
            "X-Org": organizationPayload.id
        }
    });
    adminStaff = addAdminToStaff.data?.content?.data;

    const addEditorToStaff = await agent.Post<IResponse<IStaffWithUser>>("/v1/staff", {
        user_id: editorUser?.data?.data?.id,
        role_id: "editor",
        organization_id: organizationPayload.id
    }, {
        headers: {
            "X-Org": organizationPayload.id
        }
    });
    editorStaff = addEditorToStaff.data?.content?.data;

    const addReviewerToStaff = await agent.Post<IResponse<IStaffWithUser>>("/v1/staff", {
        user_id: reviewerUser?.data?.data?.id,
        role_id: "reviewer",
        organization_id: organizationPayload.id
    }, {
        headers: {
            "X-Org": organizationPayload.id
        }
    });
    reviewerStaff = addReviewerToStaff.data?.content?.data;
});

beforeEach(async () => {
    await agent.Post("/v1/auth/signin", superAdminUserPayload);
    await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});

    const blogResponse = await agent.Post<IResponse<IBlogWithCreatedByStaffAndOrg>>("/v1/blog", blogForPublish, {
        headers: {
            "X-Org": organizationPayload.id
        }
    });

    blogForPublish.id = blogResponse.data?.content?.data?.id ?? "";
});

describe("Blog E2E Test", () => {
    it("should create a blog post when logged in as super admin", async () => {
        const blogPayload = {
            title: faker.lorem.word(),
            content: faker.lorem.sentence(),
        }
        const res = await agent.Post<IResponse<IBlogWithCreatedByStaffAndOrg>>("/v1/blog", blogPayload, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res.data?.status).toBe(true);
        expect(res.data?.content?.data?.title).toBe(blogPayload.title);
        expect(res.data?.content?.data?.content).toBe(blogPayload.content);
    });

    it("should create a blog post when logged in as admin", async () => {

        await agent.Post("/v1/auth/signin", adminUserPayload);
        await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});

        const blogPayload = {
            title: faker.lorem.word(),
            content: faker.lorem.sentence(),
        }
        const res = await agent.Post<IResponse<IBlogWithCreatedByStaffAndOrg>>("/v1/blog", blogPayload, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res.data?.status).toBe(true);
        expect(res.data?.content?.data?.title).toBe(blogPayload.title);
        expect(res.data?.content?.data?.content).toBe(blogPayload.content);
    });

    it("should create a blog post when logged in as editor", async () => {

        await agent.Post("/v1/auth/signin", editorUserPayload);
        await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});

        const blogPayload = {
            title: faker.lorem.word(),
            content: faker.lorem.sentence(),
        }
        const res = await agent.Post<IResponse<IBlogWithCreatedByStaffAndOrg>>("/v1/blog", blogPayload, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res.data?.status).toBe(true);
        expect(res.data?.content?.data?.title).toBe(blogPayload.title);
        expect(res.data?.content?.data?.content).toBe(blogPayload.content);
    });

    it("should not create a blog post when logged in as reviewer", async () => {

        await agent.Post("/v1/auth/signin", reviewerUserPayload);
        await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});

        const blogPayload = {
            title: faker.lorem.word(),
            content: faker.lorem.sentence(),
        }
        const res = await agent.Post<IResponse<IBlogWithCreatedByStaffAndOrg>>("/v1/blog", blogPayload, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res.data?.status).toBe(false);
    });

    it("should not create a blog post when logged in as normal user", async () => {

        await agent.Post("/v1/auth/signin", normalUserPayload);

        const blogPayload = {
            title: faker.lorem.word(),
            content: faker.lorem.sentence(),
        }
        const res = await agent.Post<IResponse<IBlogWithCreatedByStaffAndOrg>>("/v1/blog", blogPayload, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res.data?.status).toBe(false);
    });

    it("should publish the blog when logged in as super admin", async () => {
        const res = await agent.Put<IResponse<IBlog>>(`/v1/blog/${blogForPublish.id}/publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(true);
        expect(res?.data?.content?.data?.published).toBe(true);
    });

    it("should publish the blog when logged in as admin", async () => {
        await agent.Post("/v1/auth/signin", adminUserPayload);
        await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});
        const res = await agent.Put<IResponse<IBlog>>(`/v1/blog/${blogForPublish.id}/publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(true);
        expect(res?.data?.content?.data?.published).toBe(true);
    });

    it("should not publish the blog when logged in as editor", async () => {
        await agent.Post("/v1/auth/signin", editorUserPayload);
        await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});
        const res = await agent.Put<IError>(`/v1/blog/${blogForPublish.id}/publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(false);
    });

    it("should not publish the blog when logged in as reviewer", async () => {
        await agent.Post("/v1/auth/signin", reviewerUserPayload);
        await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});
        const res = await agent.Put<IError>(`/v1/blog/${blogForPublish.id}/publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(false);
    });

    it("should not publish the blog when logged in as normal user", async () => {
        await agent.Post("/v1/auth/signin", normalUserPayload);
        await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});
        const res = await agent.Put<IError>(`/v1/blog/${blogForPublish.id}/publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(false);
    });

    it("should un-publish the blog when logged in as super admin", async () => {
        await agent.Put<IResponse<IBlog>>(`/v1/blog/${blogForPublish.id}/publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        const res = await agent.Put<IResponse<IBlog>>(`/v1/blog/${blogForPublish.id}/un-publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(true);
        expect(res?.data?.content?.data?.published).toBe(false);
    });

    it("should un-publish the blog when logged in as admin", async () => {
        await agent.Put<IResponse<IBlog>>(`/v1/blog/${blogForPublish.id}/publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        await agent.Post("/v1/auth/signin", adminUserPayload);
        const res = await agent.Put<IResponse<IBlog>>(`/v1/blog/${blogForPublish.id}/un-publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(true);
        expect(res?.data?.content?.data?.published).toBe(false);
    });

    it("should not un-publish the blog when logged in as editor", async () => {
        await agent.Put<IResponse<IBlog>>(`/v1/blog/${blogForPublish.id}/publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        await agent.Post("/v1/auth/signin", editorUserPayload);
        await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});
        const res = await agent.Put<IError>(`/v1/blog/${blogForPublish.id}/un-publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(false);
    });

    it("should not un-publish the blog when logged in as reviewer", async () => {
        await agent.Put<IResponse<IBlog>>(`/v1/blog/${blogForPublish.id}/publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        await agent.Post("/v1/auth/signin", reviewerUserPayload);
        await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});
        const res = await agent.Put<IError>(`/v1/blog/${blogForPublish.id}/un-publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(false);
    });

    it("should not un-publish the blog when logged in as normal user", async () => {
        await agent.Put<IResponse<IBlog>>(`/v1/blog/${blogForPublish.id}/publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        await agent.Post("/v1/auth/signin", normalUserPayload);
        await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});
        const res = await agent.Put<IError>(`/v1/blog/${blogForPublish.id}/un-publish`, {}, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(false);
    });

    it("should delete the blog when logged in as super admin", async () => {
        const res = await agent.Remove<IResponse<IBlog>>(`/v1/blog/${blogForPublish.id}/delete`, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(true);
        expect(res?.data?.content?.data?.deleted).toBe(true);
    });

    it("should delete the blog when logged in as admin", async () => {
        await agent.Post("/v1/auth/signin", adminUserPayload);
        const res = await agent.Remove<IResponse<IBlog>>(`/v1/blog/${blogForPublish.id}/delete`, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(true);
    });

    it("should not un-publish the blog when logged in as editor", async () => {
        await agent.Post("/v1/auth/signin", editorUserPayload);
        const res = await agent.Remove<IError>(`/v1/blog/${blogForPublish.id}/delete`, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(false);
    });

    it("should not un-publish the blog when logged in as reviewer", async () => {
        await agent.Post("/v1/auth/signin", reviewerUserPayload);
        const res = await agent.Remove<IError>(`/v1/blog/${blogForPublish.id}/delete`, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(false);
    });

    it("should not un-publish the blog when logged in as normal user", async () => {
        await agent.Post("/v1/auth/signin", normalUserPayload);
        const res = await agent.Remove<IError>(`/v1/blog/${blogForPublish.id}/delete`, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(false);
    });

    it("should add comment on the blog when logged in as normal user", async () => {
        await agent.Post("/v1/auth/signin", normalUserPayload);
        const commentPayload = {
            comment: faker.lorem.sentence(),
        }
        const res = await agent.Post<IResponse<IBlogCommentWithCreatedByUserAndBlog>>(`/v1/blog/${blogForPublish.id}/comment`, commentPayload, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(true);
        expect(res?.data?.content?.data?.comment).toBe(commentPayload.comment);
    });

    it("should not add a comment on the blog when not logged in", async () => {
        await agent.Post("/v1/auth/signout", {});
        const commentPayload = {
            comment: faker.lorem.sentence(),
        }
        const res = await agent.Post<IError>(`/v1/blog/${blogForPublish.id}/comment`, commentPayload, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(false);
    });

    it("should add review on the blog when logged in as reviewer", async () => {
        await agent.Post("/v1/auth/signin", reviewerUserPayload);
        await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});
        const reviewPayload = {
            review: faker.lorem.sentence(),
        }
        const res = await agent.Post<IResponse<IBlogReviewWithCreatedByUserAndBlog>>(`/v1/blog/${blogForPublish.id}/review`, reviewPayload, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(true);
        expect(res?.data?.content?.data?.review).toBe(reviewPayload.review);
    });

    it("should not add review on the blog when logged in as editor", async () => {
        await agent.Post("/v1/auth/signin", editorUserPayload);
        await agent.Post<IResponse<any>>(`/v1/organization/${organizationPayload.id}/login`, {});
        const reviewPayload = {
            review: faker.lorem.sentence(),
        }
        const res = await agent.Post<IError>(`/v1/blog/${blogForPublish.id}/review`, reviewPayload, {
            headers: {
                "X-Org": organizationPayload.id
            }
        });
        expect(res?.data?.status).toBe(false);
    });
});