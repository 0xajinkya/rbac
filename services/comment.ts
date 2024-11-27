import { IBlogCommentCreate, IBlogCommentInput, IBlogReviewCreate, IBlogReviewInput } from "@interfaces/blog"
import { ICommonUser } from "@interfaces/common";
import { IStaff } from "@interfaces/identity/staff";
import { IPrismaOptions } from "@interfaces/prisma"
import { helper } from "@libraries/helper"
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
    const result = await (await Database.getTransaction(options)).blog_comment.create({
        data: document
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
    const result = await (await Database.getTransaction(options)).blog_review.create({
        data: document
    });
    return result;
}

export const CommentService = {
    Create,
    Review
}