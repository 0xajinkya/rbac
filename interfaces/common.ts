export interface IResponse<T, K = Record<string, unknown>> {
  status: boolean;
  content: {
    meta?: K;
    data: T;
  };
}

export interface ITokenPayload<T, K = Record<string, unknown>> {
  content: { data: T; meta?: K };
  iat: string;
  iss: string;
  sub: string;
}

export interface ICommonUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  active_organization_id: string | null;
}

export type TCommonUser = Pick<
  ICommonUser,
  | 'id'
  | 'first_name'
  | 'email'
>;


export type Prettify<T> = {
  [K in keyof T]: T[K];
};

export type Optional<T, K extends keyof T> = Prettify<
  Omit<T, K> & Partial<Pick<T, K>>
>;

export type Mandatory<T, K extends keyof T> = Prettify<
  Pick<T, K> & Partial<Omit<T, K>>
>;

export interface IContextToken {
  access_token: string;
  refresh_token: string;
}

export interface IContext {
  token?: IContextToken;
  session?: ICommonUser;
  organization_id?: string;
  organization_user?: any;
  [key: string]: unknown;
}