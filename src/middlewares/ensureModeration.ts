import {
    Request,
    Response,
    NextFunction
} from "express";

import {
    ForbiddenError,
    InternalServerError
} from "@/errors";

export const ensureModeration = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const authenticationData = request.user;
        if (!authenticationData) {
            /* eslint-disable-next-line no-console */
            console.error("Expected user authentication at ensure moderation middleware");
            return response.status(500).json(
                new InternalServerError()
            );
        }

        const { type } = authenticationData;
        if (type !== "ADMIN")
            return response.status(403).json(
                new ForbiddenError("You don't have the necessary permissions to access this resource")
            );

        return next();
    } catch (error) {
        /* eslint-disable-next-line no-console */
        console.error(error instanceof Error ? error.stack || error.message : error);
        return response.status(500).json(
            new InternalServerError()
        );
    }
};