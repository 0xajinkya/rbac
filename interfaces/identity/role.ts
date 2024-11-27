
export interface IRole {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type IRoleUpdate = Partial<IRole>;

export interface IRoleCreate extends IRoleUpdate {
  name: string;
}