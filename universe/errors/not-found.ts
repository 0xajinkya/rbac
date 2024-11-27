import { Mate } from "@theinternetfolks/mate";
import { CustomError, type IErrorSeralized } from "./custom-error";
import { codes } from "./codes";

export class NotFoundError extends CustomError {
    statusCode = 404;
    constructor() {
        super("Not Found");

        Object.setPrototypeOf(this, NotFoundError.prototype);
    }

    serialize(): IErrorSeralized[] {
        return [
            {
                message: codes.NotFound,
                code: Mate.toConstant('NotFound')
            },
        ];
    }
};