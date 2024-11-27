import { IBlogCommentInput, IBlogCreate, IBlogInput, IBlogUpdate } from "@interfaces/blog"
import { IRole } from "@interfaces/identity";
import { IStaff } from "@interfaces/identity/staff";
import { IPrismaOptions } from "@interfaces/prisma";
import { helper } from "@libraries/helper";
import { Context as CoreContext } from "@theinternetfolks/context"
import { PlatformError } from "@universe/errors";
import { Database } from "@universe/loaders/database";
import { CommentService } from "./comment";

const Create = async (data: IBlogInput, options?: IPrismaOptions & { published?: boolean }) => {
    const {
        organization_id: organization,
        staff
    } = CoreContext.get<{
        organization_id: string,
        staff: IStaff & { role: IRole }
    }>();

    const document: IBlogCreate = {
        id: helper.getId(),
        title: data.title,
        content: data.content,
        created_at: new Date(),
        updated_at: new Date(),
        organization_id: organization,
        created_by_staff_id: staff.id,
        published: options?.published ? true : false,
    }

    const result = await (await Database.getTransaction(options)).blog.create({
        data: document
    });
    return result;
}

const Get = async (identifier: string, options?: IPrismaOptions) => {
    const transaction = await Database.getTransaction(options);
    const response = await transaction.blog.findFirst({
        where: {
            id: identifier
        }
    });
    return response;
}

const Publish = async (identifier: string, options?: IPrismaOptions) => {

    const blog = await Get(identifier, options);
    if (!blog) {
        throw new PlatformError("ResourceNotFound", {
            resource: "Blog",
        })
    }
    const response = await Update(identifier, { published: true }, options);

    return response;
}

const UnPublish = async (identifier: string, options?: IPrismaOptions) => {

    const blog = await Get(identifier, options);
    if (!blog) {
        throw new PlatformError("ResourceNotFound", {
            resource: "Blog",
        })
    }

    const response = await Update(identifier, { published: false }, options);
    return response;
}

const Delete = async (identifier: string, options?: IPrismaOptions) => {

    const blog = await Get(identifier, options);
    if (!blog) {
        throw new PlatformError("ResourceNotFound", {
            resource: "Blog",
        })
    }

    const response = await Update(identifier, { deleted: false }, options);
    return response;
}

const Update = async (identifier: string, data: IBlogUpdate, options?: IPrismaOptions) => {
    const {
        content,
        title,
        published,
        deleted
    } = data;

    const blog = await Get(identifier, options);

    if (!blog) {
        throw new PlatformError("ResourceNotFound", {
            resource: "Blog",
        })
    }
    const transaction = await Database.getTransaction(options);

    const document: IBlogUpdate = {};

    if (typeof content !== 'undefined') {
        document.content = content;
    }

    if (typeof title !== 'undefined') {
        document.title = title;
    }

    if (typeof published !== 'undefined') {
        document.published = published;
    }

    if (typeof deleted !== 'undefined') {
        document.deleted = deleted;
    }

    const response = await transaction.blog.update({
        where: {
            id: identifier
        },
        data: {
            ...document
        }
    });
    return response;
}

const Comment = async (identifier: string, data: { comment: string }, options?: IPrismaOptions) => {
    const {
        comment
    } = data;
    const blog = await Get(identifier, options);

    if (!blog) {
        throw new PlatformError("ResourceNotFound", {
            resource: "Blog",
        })
    }
    const createdComment = await CommentService.Create({
        comment,
        blog_id: blog.id
    }, options);
    return createdComment;
}

const Review = async (identifier: string, data: { review: string }, options?: IPrismaOptions) => {
    const {
        review
    } = data;
    const blog = await Get(identifier, options);

    if (!blog) {
        throw new PlatformError("ResourceNotFound", {
            resource: "Blog",
        })
    }
    const createdReview = await CommentService.Review({
        review,
        blog_id: blog.id
    }, options);
    return createdReview;
}

export const BlogService = {
    Create,
    Get,
    Publish,
    UnPublish,
    Update,
    Delete,
    Comment,
    Review
}