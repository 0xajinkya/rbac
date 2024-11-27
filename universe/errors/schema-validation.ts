import { Mate } from "@theinternetfolks/mate";
import { CustomError, type IErrorSeralized } from "./custom-error";

export type ParamError = { message: string; param: string };

export class SchemaValidationError extends CustomError {
    errors: ParamError[];

    code = 'InvalidInput';

    statusCode = 400;

    constructor(errors: ParamError[] = []) {
        super('InvalidInput');
        // Only because we are extending a built in class
        Object.setPrototypeOf(this, SchemaValidationError.prototype);
        this.errors = errors;
    }

    serialize(): IErrorSeralized[] {
        return this.errors.map((item) => ({
            message: item.message,
            code: Mate.toConstant('InvalidInput'),
            param: item.param
        }));
    }
}
