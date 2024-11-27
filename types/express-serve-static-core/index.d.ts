declare global {
  declare namespace Express {
    export interface Request {
      rawBody: string;
    }
  }
}