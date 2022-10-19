import { ZodError } from "zod";

export const handleZodError = (error: ZodError) => error
    .issues
    .map(
        issue => issue.message
    );