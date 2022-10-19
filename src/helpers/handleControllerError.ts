import { Response } from "express";

export const handleControllerError = (error: unknown, response: Response) => {
    /* eslint-disable no-console */
    const errorMessage = error instanceof Error
        ? error.stack || error.message
        : error;
    console.error(errorMessage);

    return response.status(500).json(
        {
            error: "Internal server error"
        }
    );
    /* eslint-enable no-console */
};