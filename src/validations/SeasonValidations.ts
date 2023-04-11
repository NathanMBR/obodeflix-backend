import { z as zod } from "zod";

import { getPaginationParameters } from "@/helpers";

/* eslint-disable camelcase */
export class SeasonValidations {
    create(seasonData: any) {
        const createSeasonSchema = zod.object(
            {
                name: zod
                    .string(
                        {
                            required_error: "The season name is required",
                            invalid_type_error: "The season name must be a string",
                            description: "The season name"
                        }
                    )
                    .min(1, "The season name must have a minimum of 1 character")
                    .max(255, "The season name must have a maximum of 255 characters")
                    .trim(),

                description: zod
                    .string(
                        {
                            invalid_type_error: "The description must be a string",
                            description: "The season description"
                        }
                    )
                    .trim()
                    .nullable()
                    .optional(),

                type: zod
                    .enum(
                        [
                            "TV",
                            "MOVIE",
                            "OTHER"
                        ],

                        {
                            required_error: "The season type is required",
                            invalid_type_error: "The season type must be a string",
                            description: "The season type"
                        }
                    ),

                seriesId: zod
                    .number(
                        {
                            required_error: "The season series ID is required",
                            invalid_type_error: "The season series ID must be a number",
                            description: "The season series ID"
                        }
                    )
                    .int("The series ID must be an integer")
                    .positive("The series ID must be a positive number"),

                position: zod
                    .number(
                        {
                            required_error: "The season position is required",
                            invalid_type_error: "The season position must be a number",
                            description: "The season position"
                        }
                    )
                    .int("The season position must be an integer"),

                imageAddress: zod
                    .string(
                        {
                            invalid_type_error: "The image address must be a string",
                            description: "The series image address"
                        }
                    )
                    .trim()
                    .nullable()
                    .optional(),

                excludeFromMostRecent: zod
                    .boolean(
                        {
                            invalid_type_error: "The series \"exclude from most recent\" option must be a boolean",
                            description: "The series \"exclude from most recent\" option"
                        }
                    )
                    .nullable()
                    .optional()
            }
        );

        return createSeasonSchema.safeParse(seasonData);
    }

    findOne(seasonData: any) {
        const findOneSeasonSchema = zod.object(
            {
                id: zod
                    .number(
                        {
                            required_error: "The season ID is required",
                            invalid_type_error: "The season ID must be a number",
                            description: "The season ID"
                        }
                    )
                    .int("The season ID must be an integer")
                    .positive("The season ID must be a positive number")
            }
        );

        return findOneSeasonSchema.safeParse(seasonData);
    }

    findAll(
        seasonData: {
            page: number;
            quantity: number;
            orderColumn: string;
            orderBy: string;
            search: string;
            seriesId: number;
        }
    ) {
        const availableOrders = [
            "asc",
            "desc"
        ];

        const columnsToOrderBy = [
            "id",
            "name",
            "updatedAt"
        ];

        const { take, skip } = getPaginationParameters(seasonData.page, seasonData.quantity);

        const orderColumn = columnsToOrderBy.includes(seasonData.orderColumn)
            ? seasonData.orderColumn
            : "name";

        const orderBy = availableOrders.includes(seasonData.orderBy)
            ? seasonData.orderBy
            : "asc";

        const seriesId = Number.isNaN(seasonData.seriesId)
            ? undefined
            : seasonData.seriesId;

        const { search } = seasonData;

        return {
            take,
            skip,
            orderColumn,
            orderBy,
            search,
            seriesId
        };
    }

    update(seasonData: any) {
        const updateSeasonSchema = zod.object(
            {
                id: zod
                    .number(
                        {
                            required_error: "The season ID is required",
                            invalid_type_error: "The season ID must be a number",
                            description: "The season ID"
                        }
                    )
                    .int("The season ID must be an integer")
                    .positive("The season ID must be a positive number"),

                name: zod
                    .string(
                        {
                            required_error: "The season name is required",
                            invalid_type_error: "The season name must be a string",
                            description: "The season name"
                        }
                    )
                    .min(1, "The season name must have a minimum of 1 character")
                    .max(255, "The season name must have a maximum of 255 characters")
                    .trim(),

                description: zod
                    .string(
                        {
                            invalid_type_error: "The description must be a string",
                            description: "The season description"
                        }
                    )
                    .trim()
                    .nullable()
                    .optional(),

                type: zod
                    .enum(
                        [
                            "TV",
                            "MOVIE",
                            "OTHER"
                        ],

                        {
                            required_error: "The season type is required",
                            invalid_type_error: "The season type must be a string",
                            description: "The season type"
                        }
                    ),

                seriesId: zod
                    .number(
                        {
                            required_error: "The season series ID is required",
                            invalid_type_error: "The season series ID must be a number",
                            description: "The season series ID"
                        }
                    )
                    .int("The series ID must be an integer")
                    .positive("The series ID must be a positive number"),

                position: zod
                    .number(
                        {
                            required_error: "The season position is required",
                            invalid_type_error: "The season position must be a number",
                            description: "The season position"
                        }
                    )
                    .int("The season position must be an integer"),

                imageAddress: zod
                    .string(
                        {
                            invalid_type_error: "The image address must be a string",
                            description: "The series image address"
                        }
                    )
                    .trim()
                    .nullable()
                    .optional(),

                excludeFromMostRecent: zod
                    .boolean(
                        {
                            invalid_type_error: "The series \"exclude from most recent\" option must be a boolean",
                            description: "The series \"exclude from most recent\" option"
                        }
                    )
                    .nullable()
                    .optional()
            }
        );

        return updateSeasonSchema.safeParse(seasonData);
    }

    inactivate(seasonData: any) {
        const inactivateSeasonSchema = zod.object(
            {
                id: zod
                    .number(
                        {
                            required_error: "The season ID is required",
                            invalid_type_error: "The season ID must be a number",
                            description: "The season ID"
                        }
                    )
                    .int("The season ID must be an integer")
                    .positive("The season ID must be a positive number")
            }
        );

        return inactivateSeasonSchema.safeParse(seasonData);
    }
}