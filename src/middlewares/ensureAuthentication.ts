import { NextFunction, Request, Response } from "express";
import {
    verify,
    TokenExpiredError,
    JsonWebTokenError,
    NotBeforeError
} from "jsonwebtoken";

import { SECRET } from "@/config";
import {
    ValidationError,
    UnauthorizedError,
    InternalServerError
} from "@/errors";

export const ensureAuthentication = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader)
            return response.status(401).json(
                new UnauthorizedError("Your authentication token hasn't been provided (please authenticate)")
            );

        const [tokenType, token] = authHeader.split(" ");

        if (tokenType !== "Bearer")
            return response.status(401).json(
                new ValidationError(["Your authentication token isn't valid (please reauthenticate)"])
            );

        if (!token)
            return response.status(401).json(
                new ValidationError(["Your authentication token hasn't been provided (please authenticate)"])
            );

        const userData = verify(token, SECRET);
        const userId = Number(userData.sub);

        if (Number.isNaN(userId)) {
            /* eslint-disable-next-line no-console */
            console.error("Unexpected string at ensure authentication middleware");

            return response.status(401).json(
                new InternalServerError()
            );
        }

        request.user = {
            sub: userId
        };

        return next();
    } catch (error) {
        if (error instanceof TokenExpiredError)
            return response.status(401).json(
                new UnauthorizedError("Your authentication token has expired (please reauthenticate)")
            );

        if (error instanceof JsonWebTokenError)
            return response.status(401).json(
                new ValidationError(["Your authentication token isn't valid (please reauthenticate)"])
            );

        if (error instanceof NotBeforeError)
            return response.status(401).json(
                new UnauthorizedError("This resource isn't available yet (please try again later)")
            );

        /* eslint-disable-next-line no-console */
        console.error(error instanceof Error ? error.stack || error.message : error);
        return response.status(500).json(
            new InternalServerError()
        );
    }
};