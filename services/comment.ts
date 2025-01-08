import { IBlogCommentCreate, IBlogCommentInput, IBlogReviewCreate, IBlogReviewInput } from "@interfaces/blog"
import { ICommonUser } from "@interfaces/common";
import { IStaff } from "@interfaces/identity/staff";
import { IPrismaOptions } from "@interfaces/prisma"
import { helper } from "@libraries/helper"
import { CommentSchema, ReviewSchema } from "@schema/blog";
import { Context as CoreContext } from "@theinternetfolks/context";
import { Database } from "@universe/loaders/database";

const Create = async (data: IBlogCommentInput, options?: IPrismaOptions) => {
    const user = CoreContext.get<ICommonUser>("session");
    const document: IBlogCommentCreate = {
        id: helper.getId(),
        comment: data.comment,
        created_at: new Date(),
        updated_at: new Date(),
        blog_id: data.blog_id,
        created_by_user_id: user.id
    }

    helper.isValidSchema(document, CommentSchema);

    const result = await (await Database.getTransaction(options)).blog_comment.create({
        data: document,
        include: {
            created_by_user: true,
            blog: true
        }
    });
    return result;
}

const Review = async (data: IBlogReviewInput, options?: IPrismaOptions) => {
    const staff = CoreContext.get<IStaff>("staff");
    const document: IBlogReviewCreate = {
        id: helper.getId(),
        review: data.review,
        created_at: new Date(),
        updated_at: new Date(),
        blog_id: data.blog_id,
        created_by_staff_id: staff.id
    }
    helper.isValidSchema(document, ReviewSchema);
    const result = await (await Database.getTransaction(options)).blog_review.create({
        data: document,
        include: {
            blog: true,
            created_by_staff: true
        }
    });
    return result;
}

export const CommentService = {
    /**
     * Creates a new comment on a blog post.
     * 
     * @function Create
     * @async
     * @param {IBlogCommentInput} data - The input data for the comment (comment text, associated blog ID).
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<BlogComment>} - The created comment.
     * 
     * @throws {PlatformError} - Throws an error if creation fails.
    */
    Create,
    /**
     * Creates a new review for a blog post.
     * 
     * @function Review
     * @async
     * @param {IBlogReviewInput} data - The input data for the review (review text, associated blog ID).
     * @param {IPrismaOptions} options - Optional Prisma transaction options.
     * @returns {Promise<BlogReview>} - The created review.
     * 
     * @throws {PlatformError} - Throws an error if creation fails.
    */
    Review
}