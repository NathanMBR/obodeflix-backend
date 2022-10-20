import { HttpError } from "./HttpError";

export class NotFoundError extends HttpError {
    constructor(reason: string) {
        super("Not found", 401, reason);
    }
}