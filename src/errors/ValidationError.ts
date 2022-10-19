import { HttpError } from "./HttpError";

export class ValidationError extends HttpError {
    constructor(
        public readonly reason: Array<string>
    ) {
        super("Validation error", 400, reason);
    }
}