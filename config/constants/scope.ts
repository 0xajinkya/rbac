import { RoleNameFromKey } from "./roles";

export const scopes = {
    user: {
        all: 'user:all',
        create: 'user:create',
        read: 'user:read',
        update: 'user:update',
        delete: 'user:delete',
        comment: 'user:comment' // Ability to comment on blogs
    },
    organization: {
        all: 'organization:all',
        create: 'organization:create',
        read: 'organization:read',
        update: 'organization:update',
        delete: 'organization:delete'
    },
    staff: {
        all: 'staff:all',
        create: 'staff:create',
        read: 'staff:read',
        invite: 'staff:invite',
        update: 'staff:update',
        remove: 'staff:remove'
    },
    blog: {
        all: 'blog:all',
        create: 'blog:create',
        read: 'blog:read',
        update: 'blog:update',
        delete: 'blog:delete',
        comment: 'blog:comment',
        review: 'blog:review',
        publish: 'blog:publish',
        unpublish: 'blog:unpublish'
    }
};

export const permissions = {
    [RoleNameFromKey.super_admin]: ["*"],
    [RoleNameFromKey.admin]: [
        scopes.user.read,
        scopes.organization.read,
        scopes.organization.update,
        scopes.organization.delete,
        scopes.staff.all,
        scopes.blog.all
    ],
    [RoleNameFromKey.editor]: [
        scopes.organization.read,
        scopes.staff.read,
        scopes.blog.create,
        scopes.blog.update,
        scopes.blog.comment,
    ],
    [RoleNameFromKey.reviewer]: [
        scopes.organization.read,
        scopes.staff.read,
        scopes.blog.read,
        scopes.blog.review,
        scopes.blog.comment
    ],
    [RoleNameFromKey.user]: [
        scopes.user.all,
        scopes.blog.comment,
        scopes.blog.read,
    ]
}