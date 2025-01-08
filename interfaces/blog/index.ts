import { Mandatory } from "@interfaces/common";
import { IOrganization, IRole, IUser } from "@interfaces/identity";
import { IStaff } from "@interfaces/identity/staff";
import { blog, blog_comment, blog_review } from "@prisma/client";

export type IBlog = blog;

export type IBlogInput = Omit<Mandatory<IBlog, "content" | "title">, 'id' | 'created_at' | 'updated_at' | "organization_id" | "created_by_staff_id">;

export type IBlogCreate = Omit<Mandatory<IBlog, "content" | "title" | 'id' | 'created_at' | 'updated_at' | "organization_id" | "created_by_staff_id">, "deleted">;

export type IBlogUpdate = Partial<Omit<IBlog, 'id' | 'created_at' | 'updated_at' | "organization_id" | "created_by_staff_id">>;

export type IBlogComment = blog_comment;

export type IBlogCommentInput = Omit<Mandatory<IBlogComment, "comment" | "blog_id">, 'id' | 'created_at' | 'updated_at'>;

export type IBlogCommentCreate = Omit<Mandatory<IBlogComment, "comment" | 'id' | 'created_at' | 'updated_at' | "blog_id" | "created_by_user_id">, 'deleted'>;

export type IBlogCommentUpdate = Partial<Omit<IBlogComment, 'id' | 'created_at' | 'updated_at' | "blog_id" | "created_by_user_id">>;

export type IBlogReview = blog_review;

export type IBlogReviewInput = Omit<Mandatory<IBlogReview, "review" | "blog_id">, 'id' | 'created_at' | 'updated_at'>;

export type IBlogReviewCreate = Omit<Mandatory<IBlogReview, "review" | 'id' | 'created_at' | 'updated_at' | "blog_id" | "created_by_staff_id">, 'deleted'>;

export type IBlogReviewUpdate = Partial<Omit<IBlogReview, 'id' | 'created_at' | 'updated_at' | "blog_id" | "created_by_staff_id">>; 

export type IBlogWithCreatedByStaffAndOrg = IBlog & {
    created_by_staff: IStaff & {
        user: IUser | null
        role: IRole | null;
    };
    organization: IOrganization | null;
}

export type IBlogCommentWithCreatedByUserAndBlog = IBlogComment & {
    created_by_user: IUser | null;
    blog: IBlog | null;
}

export type IBlogReviewWithCreatedByUserAndBlog = IBlogReview & {
    created_by_staff: IStaff | null;
    blog: IBlog | null;
}