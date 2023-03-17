import { z as zod } from "zod";

/* eslint-disable camelcase */
export class CommentValidations {
    create(commentData: any) {
        const createCommentSchema = zod.object(
            {
                body: zod
                    .string(
                        {
                            required_error: "The comment body is required",
                            invalid_type_error: "The comment body must be a string",
                            description: "The comment body"
                        }
                    )
                    .min(1, "The comment body must have at least 1 character"),

                parentId: zod
                    .number(
                        {
                            required_error: "The comment parent ID is required",
                            invalid_type_error: "The comment parent ID must be a number",
                            description: "The comment parent ID"
                        }
                    )
                    .int("The comment parent ID must be an integer")
                    .positive("The comment parent ID must be a positive number")
                    .min(1, "The comment parent ID must be greater than zero")
                    .nullable()
                    .optional(),

                seriesId: zod
                    .number(
                        {
                            required_error: "The comment series ID is required",
                            invalid_type_error: "The comment series ID must be a number",
                            description: "The comment series ID"
                        }
                    )
                    .int("The comment series ID must be an integer")
                    .positive("The comment series ID must be a positive number")
                    .min(1, "The comment series ID must be greater than zero")
                    .nullable()
                    .optional(),

                episodeId: zod
                    .number(
                        {
                            required_error: "The comment episode ID is required",
                            invalid_type_error: "The comment episode ID must be a number",
                            description: "The comment episode ID"
                        }
                    )
                    .int("The comment episode ID must be an integer")
                    .positive("The comment episode ID must be a positive number")
                    .min(1, "The comment episode ID must be greater than zero")
                    .nullable()
                    .optional()
            }
        );

        return createCommentSchema.safeParse(commentData);
    }

    update(commentData: any) {
        const updateCommentSchema = zod.object(
            {
                id: zod
                    .number(
                        {
                            required_error: "The comment ID is required",
                            invalid_type_error: "The comment ID must be a number",
                            description: "The comment ID"
                        }
                    )
                    .int("The comment ID must be an integer")
                    .positive("The comment ID must be a positive number")
                    .min(1, "The comment ID must be greater than zero"),

                body: zod
                    .string(
                        {
                            required_error: "The comment body is required",
                            invalid_type_error: "The comment body must be a string",
                            description: "The comment body"
                        }
                    )
                    .min(1, "The comment body must have at least 1 character"),

                parentId: zod
                    .number(
                        {
                            required_error: "The comment parent ID is required",
                            invalid_type_error: "The comment parent ID must be a number",
                            description: "The comment parent ID"
                        }
                    )
                    .int("The comment parent ID must be an integer")
                    .positive("The comment parent ID must be a positive number")
                    .min(1, "The comment parent ID must be greater than zero")
                    .nullable()
                    .optional(),

                seriesId: zod
                    .number(
                        {
                            required_error: "The comment series ID is required",
                            invalid_type_error: "The comment series ID must be a number",
                            description: "The comment series ID"
                        }
                    )
                    .int("The comment series ID must be an integer")
                    .positive("The comment series ID must be a positive number")
                    .min(1, "The comment series ID must be greater than zero")
                    .nullable()
                    .optional(),

                episodeId: zod
                    .number(
                        {
                            required_error: "The comment episode ID is required",
                            invalid_type_error: "The comment episode ID must be a number",
                            description: "The comment episode ID"
                        }
                    )
                    .int("The comment episode ID must be an integer")
                    .positive("The comment episode ID must be a positive number")
                    .min(1, "The comment episode ID must be greater than zero")
                    .nullable()
                    .optional()
            }
        );

        return updateCommentSchema.safeParse(commentData);
    }

    inactivate(commentData: any) {
        const inactivateCommentSchema = zod.object(
            {
                id: zod
                    .number(
                        {
                            required_error: "The comment ID is required",
                            invalid_type_error: "The comment ID must be a number",
                            description: "The comment ID"
                        }
                    )
                    .int("The comment ID must be an integer")
                    .positive("The comment ID must be a positive number")
            }
        );

        return inactivateCommentSchema.safeParse(commentData);
    }
}
/* eslint-disable camelcase */