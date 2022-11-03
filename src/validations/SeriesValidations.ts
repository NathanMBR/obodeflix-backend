import { z as zod } from "zod";

import {
    removeRepeatedElements,
    getPaginationParameters
} from "@/helpers";

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
                    .nullable()
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
                    .nullable()
                    .optional(),

                imageAddress: zod
                    .string(
                        {
                            invalid_type_error: "The image address must be a string",
                            description: "The series image address"
                        }
                    )
                    .nullable()
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

    findAll(
        seriesData: {
            page: number;
            quantity: number;
            orderColumn: string;
            orderBy: string;
            search: string;
        }
    ) {
        const availableOrders = [
            "asc",
            "desc"
        ];

        const columnsToOrderBy = [
            "id",
            "mainName",
            "updatedAt"
        ];

        const { take, skip } = getPaginationParameters(seriesData.page, seriesData.quantity);

        const orderColumn = columnsToOrderBy.includes(seriesData.orderColumn)
            ? seriesData.orderColumn
            : "mainName";

        const orderBy = availableOrders.includes(seriesData.orderBy)
            ? seriesData.orderBy
            : "asc";

        const { search } = seriesData;

        return {
            take,
            skip,
            orderColumn,
            orderBy,
            search
        };
    }

    update(seriesData: any) {
        const updateSeriesSchema = zod.object(
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
                    .positive("The series ID must be a positive number"),

                mainName: zod
                    .string(
                        {
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
                    .nullable()
                    .optional(),

                mainNameLanguage: zod
                    .enum(
                        [
                            "ENGLISH",
                            "JAPANESE"
                        ],

                        {
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
                    .nullable()
                    .optional(),

                imageAddress: zod
                    .string(
                        {
                            invalid_type_error: "The image address must be a string",
                            description: "The series image address"
                        }
                    )
                    .nullable()
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
                            invalid_type_error: "The series tags must be a number array",
                            description: "The series tags"
                        }
                    )
                    .transform(removeRepeatedElements)
            }
        );

        return updateSeriesSchema.safeParse(seriesData);
    }

    inactivate(seriesData: any) {
        const inactivateSeriesSchema = zod.object(
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

        return inactivateSeriesSchema.safeParse(seriesData);
    }
}
/* eslint-enable camelcase */