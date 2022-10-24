import { z as zod } from "zod";

import { getPaginationParameters } from "@/helpers";

/* eslint-disable camelcase */
export class TagValidations {
    create(tagData: any) {
        const createTagSchema = zod.object(
            {
                name: zod
                    .string(
                        {
                            required_error: "The tag name is required",
                            invalid_type_error: "The tag name must be a string",
                            description: "The tag name"
                        }
                    )
                    .min(1, "The tag name must have a minimum of 1 character")
                    .max(255, "The tag name must have a maximum of 255 characters")
            }
        );

        return createTagSchema.safeParse(tagData);
    }

    findOne(tagData: any) {
        const findOneTagSchema = zod.object(
            {
                id: zod
                    .number(
                        {
                            required_error: "The tag ID is required",
                            invalid_type_error: "The tag ID must be a number",
                            description: "The tag ID"
                        }
                    )
                    .int("The tag ID must be an integer")
                    .positive("The tag ID must be a positive number")
            }
        );

        return findOneTagSchema.safeParse(tagData);
    }

    findAll(
        tagData: {
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
            "name",
            "updatedAt"
        ];

        const { take, skip } = getPaginationParameters(tagData.page, tagData.quantity);

        const orderColumn = columnsToOrderBy.includes(tagData.orderColumn)
            ? tagData.orderColumn
            : "name";

        const orderBy = availableOrders.includes(tagData.orderBy)
            ? tagData.orderBy
            : "asc";

        const { search } = tagData;

        return {
            take,
            skip,
            orderColumn,
            orderBy,
            search
        };
    }

    update(tagData: any) {
        const updateTagSchema = zod.object(
            {
                id: zod
                    .number(
                        {
                            required_error: "The tag ID is required",
                            invalid_type_error: "The tag ID must be a number",
                            description: "The tag ID"
                        }
                    )
                    .int("The tag ID must be an integer")
                    .positive("The tag ID must be a positive number"),

                name: zod
                    .string(
                        {
                            required_error: "The tag name is required",
                            invalid_type_error: "The tag name must be a string",
                            description: "The tag name"
                        }
                    )
                    .min(1, "The tag name must have a minimum of 1 character")
                    .max(255, "The tag name must have a maximum of 255 characters")
            }
        );

        return updateTagSchema.safeParse(tagData);
    }

    inactivate(tagData: any) {
        const inactivateTagSchema = zod.object(
            {
                id: zod
                    .number(
                        {
                            required_error: "The tag ID is required",
                            invalid_type_error: "The tag ID must be a number",
                            description: "The tag ID"
                        }
                    )
                    .int("The tag ID must be an integer")
                    .positive("The tag ID must be a positive number")
            }
        );

        return inactivateTagSchema.safeParse(tagData);
    }
}