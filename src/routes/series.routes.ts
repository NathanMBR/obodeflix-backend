import { Router } from "express";

import { ensureAuthentication, ensureModeration } from "@/middlewares";
import { prisma } from "@/database";
import { SeriesValidations } from "@/validations";
import {
    ValidationError,
    NotFoundError,
    InternalServerError
} from "@/errors";
import {
    handleZodError,
    handleControllerError
} from "@/helpers";

const seriesRoutes = Router();

const seriesValidations = new SeriesValidations();

seriesRoutes.post(
    "/series/create",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at create series route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const rawSeriesData = request.body;
            const validation = seriesValidations.create(rawSeriesData);
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const {
                mainName,
                mainNameLanguage,
                alternativeName,
                description,
                tags
            } = validation.data;

            const doesAllTagsExist = await Promise.all(
                tags.map(
                    tagId => prisma.tag.findFirst(
                        {
                            select: {
                                id: true
                            },

                            where: {
                                id: tagId,
                                deletedAt: null
                            }
                        }
                    )
                )
            );

            if (doesAllTagsExist.some(tag => !tag))
                return response.status(400).json(
                    new NotFoundError("Tag not found")
                );

            const series = await prisma.series.create(
                {
                    data: {
                        mainName,
                        mainNameLanguage,
                        alternativeName,
                        description,
                        seriesTags: {
                            createMany: {
                                skipDuplicates: false,
                                data: tags.map(
                                    tag => (
                                        {
                                            tagId: tag
                                        }
                                    )
                                )
                            }
                        }
                    }
                }
            );

            return response.status(201).json(series);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

seriesRoutes.get(
    "/series/get/:id",
    async (request, response) => {
        try {
            const rawSeriesId = Number(request.params.id);

            const validation = seriesValidations.findOne(
                {
                    id: rawSeriesId
                }
            );
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const seriesId = validation.data.id;
            const series = await prisma.series.findFirst(
                {
                    where: {
                        id: seriesId,
                        deletedAt: null
                    },

                    include: {
                        seasons: {
                            include: {
                                episodes: true
                            }
                        },

                        seriesTags: {
                            include: {
                                tag: true
                            }
                        }
                    }
                }
            );
            if (!series)
                return response.status(404).json(
                    new NotFoundError("Series not found")
                );

            return response.status(200).json(series);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

export { seriesRoutes };