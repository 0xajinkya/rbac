import { Mate } from "@theinternetfolks/mate";
import { codes, ErrorCodesList } from "./codes";
import { CustomError, type IErrorSeralized } from "./custom-error";

export const GetErrorFromCode = (
    code: string,
    params: Record<string, string>,
    lang = 'en'
) =>
    Mate.format(codes[code], {
        ...(params || {})
    });

export class PlatformError extends CustomError {
    code: (typeof ErrorCodesList)[number];

    params: Record<string, string>;

    statusCode = 400;

    constructor(
        code: (typeof ErrorCodesList)[number],
        params: Record<string, string> = {},
        statusCode?: number
    ) {
        super(`${code}: ${GetErrorFromCode(code, params)}`);
        Object.setPrototypeOf(this, PlatformError.prototype);
        this.code = code;
        this.params = params;
        if (statusCode) this.statusCode = statusCode;
    }

    serialize(): IErrorSeralized[] {
        return [
            {
                message: GetErrorFromCode(this.code, this.params),
                code: Mate.toConstant(this.code)
            }
        ];
    }
};