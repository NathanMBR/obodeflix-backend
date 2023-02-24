import { z as zod } from "zod";

import { getPaginationParameters } from "@/helpers";

/* eslint-disable camelcase */
export class EpisodeValidations {
    create(episodeData: any) {
        const createEpisodeSchema = zod.object(
            {
                name: zod
                    .string(
                        {
                            required_error: "The episode name is required",
                            invalid_type_error: "The episode name must be a string",
                            description: "The episode name"
                        }
                    )
                    .min(1, "The episode name must have a minimum of 1 character")
                    .max(255, "The episode name must have a maximum of 255 characters"),

                seasonId: zod
                    .number(
                        {
                            required_error: "The episode season ID is required",
                            invalid_type_error: "The episode season ID must be a number",
                            description: "The episode season ID"
                        }
                    )
                    .int("The episode season ID must be an integer")
                    .positive("The episode season ID must be a positive number"),

                duration: zod
                    .number(
                        {
                            required_error: "The episode duration is required",
                            invalid_type_error: "The episode duration must be a number",
                            description: "The episode duration (in seconds)"
                        }
                    )
                    .int("The episode duration must be an integer")
                    .positive("The episode duration must be a positive number"),

                path: zod
                    .string(
                        {
                            required_error: "The episode path is required",
                            invalid_type_error: "The episode path must be a string",
                            description: "The episode path"
                        }
                    )
                    .min(1, "The episode path must have a minimum of 1 character")
                    .max(255, "The episode path must have a maximum of 255 characters"),

                position: zod
                    .number(
                        {
                            required_error: "The episode position is required",
                            invalid_type_error: "The episode position must be a number",
                            description: "The episode position"
                        }
                    )
                    .int("The episode position must be an integer")
            }
        );

        return createEpisodeSchema.safeParse(episodeData);
    }

    findOne(episodeData: any) {
        const findOneEpisodeSchema = zod.object(
            {
                id: zod
                    .number(
                        {
                            required_error: "The episode ID is required",
                            invalid_type_error: "The episode ID must be a number",
                            description: "The episode ID"
                        }
                    )
                    .int("The episode ID must be an integer")
                    .positive("The episode ID must be a positive number")
            }
        );

        return findOneEpisodeSchema.safeParse(episodeData);
    }

    findAll(
        episodeData: {
            page: number;
            quantity: number;
            orderColumn: string;
            orderBy: string;
            search: string;
            seasonId: number;
        }
    ) {
        const availableOrders = [
            "asc",
            "desc"
        ];

        const columnsToOrderBy = [
            "id",
            "name",
            "position",
            "updatedAt"
        ];

        const { take, skip } = getPaginationParameters(episodeData.page, episodeData.quantity);

        const orderColumn = columnsToOrderBy.includes(episodeData.orderColumn)
            ? episodeData.orderColumn
            : "position";

        const orderBy = availableOrders.includes(episodeData.orderBy)
            ? episodeData.orderBy
            : "asc";

        const { search } = episodeData;

        const seasonId = Number.isNaN(episodeData.seasonId)
            ? undefined
            : episodeData.seasonId;

        return {
            take,
            skip,
            orderColumn,
            orderBy,
            search,
            seasonId
        };
    }

    update(episodeData: any) {
        const updateEpisodeSchema = zod.object(
            {
                id: zod
                    .number(
                        {
                            required_error: "The episode ID is required",
                            invalid_type_error: "The episode ID must be a number",
                            description: "The episode ID"
                        }
                    )
                    .int("The episode ID must be an integer")
                    .positive("The episode ID must be a positive number"),

                name: zod
                    .string(
                        {
                            required_error: "The episode name is required",
                            invalid_type_error: "The episode name must be a string",
                            description: "The episode name"
                        }
                    )
                    .min(1, "The episode name must have a minimum of 1 character")
                    .max(255, "The episode name must have a maximum of 255 characters"),

                seasonId: zod
                    .number(
                        {
                            required_error: "The episode season ID is required",
                            invalid_type_error: "The episode season ID must be a number",
                            description: "The episode season ID"
                        }
                    )
                    .int("The episode season ID must be an integer")
                    .positive("The episode season ID must be a positive number"),

                duration: zod
                    .number(
                        {
                            required_error: "The episode duration is required",
                            invalid_type_error: "The episode duration must be a number",
                            description: "The episode duration (in seconds)"
                        }
                    )
                    .int("The episode duration must be an integer")
                    .positive("The episode duration must be a positive number"),

                path: zod
                    .string(
                        {
                            required_error: "The episode path is required",
                            invalid_type_error: "The episode path must be a string",
                            description: "The episode path"
                        }
                    )
                    .min(1, "The episode path must have a minimum of 1 character")
                    .max(255, "The episode path must have a maximum of 255 characters"),

                position: zod
                    .number(
                        {
                            required_error: "The episode position is required",
                            invalid_type_error: "The episode position must be a number",
                            description: "The episode position"
                        }
                    )
                    .int("The episode position must be an integer")
            }
        );

        return updateEpisodeSchema.safeParse(episodeData);
    }

    inactivate(episodeData: any) {
        const inactivateEpisodeSchema = zod.object(
            {
                id: zod
                    .number(
                        {
                            required_error: "The episode ID is required",
                            invalid_type_error: "The episode ID must be a number",
                            description: "The episode ID"
                        }
                    )
                    .int("The episode ID must be an integer")
                    .positive("The episode ID must be a positive number")
            }
        );

        return inactivateEpisodeSchema.safeParse(episodeData);
    }
}