import { HttpError } from "./HttpError";

export class UnauthorizedError extends HttpError {
    constructor(reason: string) {
        super("Unauthorized", 401, reason);
    }
}