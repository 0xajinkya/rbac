import { IBlogCommentInput, IBlogCreate, IBlogInput, IBlogUpdate } from "@interfaces/blog"
import { IRole } from "@interfaces/identity";
import { IStaff } from "@interfaces/identity/staff";
import { IPrismaOptions } from "@interfaces/prisma";
import { helper } from "@libraries/helper";
import { Context as CoreContext } from "@theinternetfolks/context"
import { PlatformError } from "@universe/errors";
import { Database } from "@universe/loaders/database";
import { CommentService } from "./comment";
import { Prisma } from "@prisma/client";

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
        },
        include: {
            organization: true,
            created_by_staff: true
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

const List = async ({
    where = {},
    include = {},
    order = {},
    limit = 10,
    skip = 0
}: {
    where?: Prisma.blogWhereInput,
    include?: Prisma.blogInclude,
    order?: Prisma.blogOrderByWithAggregationInput,
    limit?: number,
    skip?: number
}, options?: IPrismaOptions) => {
    const transaction = await Database.getTransaction(options);
    const response = await transaction.blog.findMany({
        where: {
            ...where,
            deleted: false
        },
        skip: skip < 0 ? 0 : skip,
        take: limit < 0 ? 10 : limit,
        orderBy: order,
        include
    });
    return response;
}

export const BlogService = {
    /**
     * Creates a new blog post.
     * 
     * @function Create
     * @async
     * @param {IBlogInput} data - The input data for the blog post (title, content, etc.).
     * @param {IPrismaOptions & { published?: boolean }} options - Options including whether the post is published.
     * @returns {Promise<Blog>} - The created blog post.
     * 
     * @throws {PlatformError} - Throws an error if creation fails.
    */
    Create,
    /**
     * Retrieves a blog post by its identifier.
     * 
     * @function Get
     * @async
     * @param {string} identifier - The unique ID of the blog post.
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<Blog | null>} - The blog post if found, otherwise null.
     * 
     * @throws {PlatformError} - Throws an error if the blog is not found.
    */
    Get,
    /**
     * Publishes a blog post by its identifier.
     * 
     * @function Publish
     * @async
     * @param {string} identifier - The ID of the blog post to publish.
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<Blog>} - The updated blog post with 'published' set to true.
     * 
     * @throws {PlatformError} - Throws an error if the blog post does not exist.
    */
    Publish,
    /**
     * Unpublishes a blog post by its identifier.
     * 
     * @function UnPublish
     * @async
     * @param {string} identifier - The ID of the blog post to unpublish.
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<Blog>} - The updated blog post with 'published' set to false.
     * 
     * @throws {PlatformError} - Throws an error if the blog post does not exist.
    */
    UnPublish,
    /**
     * Updates a blog post by its identifier.
     * 
     * @function Update
     * @async
     * @param {string} identifier - The ID of the blog post to update.
     * @param {IBlogUpdate} data - The updated data (content, title, published, etc.).
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<Blog>} - The updated blog post.
     * 
     * @throws {PlatformError} - Throws an error if the blog post does not exist.
    */
    Update,
    /**
     * Deletes a blog post by its identifier (soft delete).
     * 
     * @function Delete
     * @async
     * @param {string} identifier - The ID of the blog post to delete.
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<Blog>} - The updated blog post with 'deleted' set to true.
     * 
     * @throws {PlatformError} - Throws an error if the blog post does not exist.
    */
    Delete,
    /**
     * Adds a comment to a blog post.
     * 
     * @function Comment
     * @async
     * @param {string} identifier - The ID of the blog post to comment on.
     * @param {object} data - The comment data.
     * @param {string} data.comment - The comment content.
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<Comment>} - The created comment.
     * 
     * @throws {PlatformError} - Throws an error if the blog post does not exist.
    */
    Comment,
    /**
     * Adds a review to a blog post.
     * 
     * @function Review
     * @async
     * @param {string} identifier - The ID of the blog post to review.
     * @param {object} data - The review data.
     * @param {string} data.review - The review content.
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<Review>} - The created review.
     * 
     * @throws {PlatformError} - Throws an error if the blog post does not exist.
    */
    Review,
    /**
     * Lists blog posts based on filters and pagination.
     * 
     * @function List
     * @async
     * @param {object} params - The filter and pagination options.
     * @param {Prisma.blogWhereInput} params.where - Filter conditions for the blogs.
     * @param {Prisma.blogInclude} params.include - Fields to include in the response.
     * @param {Prisma.blogOrderByWithAggregationInput} params.order - Sorting options.
     * @param {number} params.limit - Maximum number of blog posts to return.
     * @param {number} params.skip - Number of blog posts to skip for pagination.
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<any[]>} - A list of blog posts matching the filters.
    */
    List
}