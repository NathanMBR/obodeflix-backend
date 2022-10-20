import { HttpError } from "./HttpError";

export class ForbiddenError extends HttpError {
    constructor(reason: string) {
        super("Forbidden", 401, reason);
    }
}