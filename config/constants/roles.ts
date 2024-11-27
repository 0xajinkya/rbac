import type { IRoleCreate } from "@interfaces/identity";

export type Roles = "super_admin" | "admin" | "editor" | "reviewer" | "user";

export const RoleNameFromKey: Record<string, typeof AllRoleList[number]> = {
  super_admin: "super_admin",
  admin: "admin",
  editor: "editor",
  reviewer: "reviewer",
  user: "user",
}

export const AllRoleList = [
  'super_admin',
  'admin',
  'editor',
  'reviewer',
  'user'
] as const;


export const RoleName = {
  'Super Admin': 'super_admin',
  Admin: 'admin',
  Viewer: 'viewer',
  Editor: 'editor',
  Guest: 'guest'
};

const DefaultRoles: IRoleCreate[] = [
  {
    name: RoleNameFromKey.super_admin
  },
  {
    name: RoleNameFromKey.admin
  },
  {
    name: RoleNameFromKey.reviewer
  },
  {
    name: RoleNameFromKey.editor
  },
  {
    name: RoleNameFromKey.user
  }
];

export default DefaultRoles;
