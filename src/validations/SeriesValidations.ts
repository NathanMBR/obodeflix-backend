import { z as zod } from "zod";

import { removeRepeatedElements } from "@/helpers";

/* eslint-disable camelcase */
export class SeriesValidations {
    create(seriesData: any) {
        const createSeriesSchema = zod.object(
            {
                mainName: zod
                    .string(
                        {
                            required_error: "The main name is required",
                            invalid_type_error: "The main name must be a string",
                            description: "The series main name"
                        }
                    )
                    .min(1, "The main name must have a minimum of 1 character")
                    .max(255, "The main name must have a maximum of 255 characters"),

                alternativeName: zod
                    .string(
                        {
                            invalid_type_error: "The alternative name must be a string",
                            description: "The series alternative name"
                        }
                    )
                    .min(1, "The alternative name must have a minimum of 1 character")
                    .max(255, "The alternative name must have a maximum of 255 characters")
                    .optional(),

                mainNameLanguage: zod
                    .enum(
                        [
                            "ENGLISH",
                            "JAPANESE"
                        ],

                        {
                            required_error: "The main name language is required",
                            invalid_type_error: "The main name language must be ENGLISH or JAPANESE",
                            description: "The series main name language"
                        }
                    ),

                description: zod
                    .string(
                        {
                            invalid_type_error: "The description must be a string",
                            description: "The series description"
                        }
                    )
                    .optional(),

                tags: zod
                    .array(
                        zod.number(
                            {
                                invalid_type_error: "The tag must be a number",
                                description: "The series tag"
                            }
                        ),

                        {
                            required_error: "The series tags are required",
                            invalid_type_error: "The series tags must be a number array",
                            description: "The series tags"
                        }
                    )
                    .transform(removeRepeatedElements)
            }
        );

        return createSeriesSchema.safeParse(seriesData);
    }

    findOne(seriesData: any) {
        const findOneSeriesSchema = zod.object(
            {
                id: zod
                    .number(
                        {
                            required_error: "The series ID is required",
                            invalid_type_error: "The series ID must be a number",
                            description: "The series ID"
                        }
                    )
                    .int("The series ID must be an integer")
                    .positive("The series ID must be a positive number")
            }
        );

        return findOneSeriesSchema.safeParse(seriesData);
    }

    findAll(seriesData: any) {
        const findAllSeriesSchema = zod.object(
            {
                page: zod
                    .number(
                        {
                            invalid_type_error: "The series page must be a number",
                            description: "The page of the series data"
                        }
                    )
                    .int("The series page must be an integer")
                    .positive("The series page must be positive")
                    .optional(),

                quantity: zod
                    .number(
                        {
                            invalid_type_error: "The series quantity must be a number",
                            description: "The quantity of series to be returned"
                        }
                    )
                    .int("The series quantity must be an integer")
                    .positive("The series quantity must be positive")
                    .optional(),

                orderColumn: zod
                    .enum(
                        [
                            "id",
                            "mainName",
                            "updatedAt"
                        ],

                        {
                            invalid_type_error: "The order column must be a string",
                            description: "The column to order by"
                        }
                    )
                    .optional(),

                orderBy: zod
                    .enum(
                        [
                            "asc",
                            "desc"
                        ],

                        {
                            required_error: "The order direction is required",
                            invalid_type_error: "The order direction must be a text",
                            description: "The order direction"
                        }
                    ),

                search: zod
                    .string(
                        {
                            required_error: "The search query is required",
                            invalid_type_error: "The search query must be a string",
                            description: "The search query"
                        }
                    )
                    .max(255, "The search query is too long (must have a maximum of 255 characters)")
            }
        );

        return findAllSeriesSchema.safeParse(seriesData);
    }
}
/* eslint-enable camelcase */