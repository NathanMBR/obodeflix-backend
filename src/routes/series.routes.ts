import { Router } from "express";

import { ensureAuthentication, ensureModeration } from "@/middlewares";
import { prisma } from "@/database";
import { SeriesValidations } from "@/validations";
import { ValidationError, NotFoundError, InternalServerError } from "@/errors";
import {
    handleZodError,
    handleControllerError,
    getPaginatedData
} from "@/helpers";

type RouterReturn = ReturnType<typeof Router>;
const seriesRoutes: RouterReturn = Router();

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
                return response.status(500).json(new InternalServerError());
            }

            const rawSeriesData = request.body;
            const validation = seriesValidations.create(rawSeriesData);
            if (!validation.success)
                return response
                    .status(400)
                    .json(new ValidationError(handleZodError(validation.error)));

            const {
                mainName,
                mainNameLanguage,
                alternativeName,
                description,
                imageAddress,
                tags
            } = validation.data;

            const doesAllTagsExist = await Promise.all(
                tags.map((tagId) =>
                    prisma.tag.findFirst({
                        select: {
                            id: true
                        },

                        where: {
                            id: tagId,
                            deletedAt: null
                        }
                    })
                )
            );

            if (doesAllTagsExist.some((tag) => !tag))
                return response.status(404).json(new NotFoundError("Tag not found"));

            const series = await prisma.series.create({
                data: {
                    mainName,
                    mainNameLanguage,
                    alternativeName,
                    description,
                    imageAddress,
                    seriesTags: {
                        createMany: {
                            skipDuplicates: false,
                            data: tags.map((tagId) => ({
                                tagId
                            }))
                        }
                    }
                }
            });

            return response.status(201).json(series);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

seriesRoutes.get("/series/get/:id", async (request, response) => {
    try {
        const rawSeriesId = Number(request.params.id);

        const validation = seriesValidations.findOne({
            id: rawSeriesId
        });
        if (!validation.success)
            return response
                .status(400)
                .json(new ValidationError(handleZodError(validation.error)));

        const seriesId = validation.data.id;
        const series = await prisma.series.findFirst({
            where: {
                id: seriesId,
                deletedAt: null
            },

            include: {
                seasons: {
                    where: {
                        deletedAt: null
                    }
                },

                seriesTags: {
                    where: {
                        deletedAt: null,

                        tag: {
                            deletedAt: null
                        }
                    },

                    include: {
                        tag: true
                    }
                },

                comments: {
                    orderBy: {
                        id: "desc"
                    },

                    where: {
                        deletedAt: null
                    },

                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        },

                        children: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        type: true
                                    }
                                }
                            },

                            orderBy: {
                                id: "asc"
                            },

                            where: {
                                deletedAt: null
                            }
                        }
                    }
                }
            }
        });
        if (!series)
            return response.status(404).json(new NotFoundError("Series not found"));

        return response.status(200).json(series);
    } catch (error) {
        return handleControllerError(error, response);
    }
});

seriesRoutes.get("/series/all", async (request, response) => {
    try {
        const rawPaginationData = {
            page: Number(request.query.page),
            quantity: Number(request.query.quantity),
            orderColumn: String(request.query.orderColumn),
            orderBy: String(request.query.orderBy),
            search: String(request.query.search || "")
        };

        const { take, skip, orderColumn, orderBy, search } =
      seriesValidations.findAll(rawPaginationData);

        const [series, seriesCount] = await Promise.all([
            prisma.series.findMany({
                take,
                skip,

                where: {
                    OR: [
                        {
                            mainName: {
                                contains: search,
                                mode: "insensitive"
                            }
                        },

                        {
                            alternativeName: {
                                contains: search,
                                mode: "insensitive"
                            }
                        }
                    ],

                    deletedAt: null
                },

                orderBy: {
                    [orderColumn]: orderBy
                }
            }),

            prisma.series.count({
                where: {
                    OR: [
                        {
                            mainName: {
                                contains: search,
                                mode: "insensitive"
                            }
                        },

                        {
                            alternativeName: {
                                contains: search,
                                mode: "insensitive"
                            }
                        }
                    ],

                    deletedAt: null
                }
            })
        ]);

        const paginatedSeries = getPaginatedData({
            take,
            skip,
            count: seriesCount,
            data: series
        });

        return response.status(200).json(paginatedSeries);
    } catch (error) {
        return handleControllerError(error, response);
    }
});

seriesRoutes.put(
    "/series/update/:id",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at update series route");
                return response.status(500).json(new InternalServerError());
            }

            const rawSeriesId = Number(request.params.id);
            const rawSeriesData = request.body;
            rawSeriesData.id = rawSeriesId;

            const validation = seriesValidations.update(rawSeriesData);
            if (!validation.success)
                return response
                    .status(400)
                    .json(new ValidationError(handleZodError(validation.error)));

            const {
                id: seriesId,
                mainName,
                mainNameLanguage,
                alternativeName,
                description,
                imageAddress,
                tags,
                seasonsOrder
            } = validation.data;

            const uniqueSeasonsOrderIds = new Set(
                seasonsOrder.map(seasonOrder => seasonOrder.id)
            );

            const uniqueSeasonOrderPositions = new Set(
                seasonsOrder.map(seasonOrder => seasonOrder.position)
            );

            const areSeasonsOrderIdsUnique = uniqueSeasonsOrderIds.size === seasonsOrder.length;
            if (!areSeasonsOrderIdsUnique)
                return response
                    .status(400)
                    .json(new ValidationError(["Seasons order IDs must be unique"]));

            const areSeasonsOrderPositionsUnique = uniqueSeasonOrderPositions.size === seasonsOrder.length;
            if (!areSeasonsOrderPositionsUnique)
                return response
                    .status(400)
                    .json(new ValidationError(["Seasons order positions must be unique"]));

            const [
                doesSeriesExist,
                doesAllTagsExist,
                doesAllSeasonsExist
            ] = await Promise.all(
                [
                    prisma.series.findFirst(
                        {
                            select: {
                                id: true
                            },

                            where: {
                                id: seriesId,
                                deletedAt: null
                            }
                        }
                    ),

                    Promise.all(
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
                    ),

                    Promise.all(
                        seasonsOrder.map(
                            seasonOrder => prisma.season.findFirst(
                                {
                                    select: {
                                        id: true
                                    },

                                    where: {
                                        id: seasonOrder.id,
                                        deletedAt: null
                                    }
                                }
                            )
                        )
                    )
                ]
            );

            if (!doesSeriesExist)
                return response
                    .status(404)
                    .json(new NotFoundError("Series not found"));

            if (doesAllTagsExist.some(tag => !tag))
                return response
                    .status(404)
                    .json(new NotFoundError("Tag not found"));

            if (doesAllSeasonsExist.some(season => !season))
                return response
                    .status(404)
                    .json(new NotFoundError("Season not found"));

            const [_deletedSeriesTags, series] = await prisma.$transaction(
                [
                    prisma.seriesTags.updateMany(
                        {
                            data: {
                                deletedAt: new Date()
                            },

                            where: {
                                seriesId,
                                deletedAt: null
                            }
                        }
                    ),

                    prisma.series.update(
                        {
                            data: {
                                mainName,
                                mainNameLanguage,
                                alternativeName,
                                description,
                                imageAddress,
                                seriesTags: {
                                    createMany: {
                                        skipDuplicates: false,
                                        data: tags.map(
                                            tagId => (
                                                {
                                                    tagId
                                                }
                                            )
                                        )
                                    }
                                }
                            },

                            where: {
                                id: seriesId
                            }
                        }
                    ),

                    ...seasonsOrder.map(
                        seasonOrder => prisma.season.update(
                            {
                                where: {
                                    id: seasonOrder.id
                                },

                                data: {
                                    position: seasonOrder.position
                                },

                                select: {
                                    id: true,
                                    position: true
                                }
                            }
                        )
                    )
                ]
            );

            return response.status(200).json(series);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

seriesRoutes.delete(
    "/series/inactivate/:id",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error(
                    "Expected user authentication at inactivate series route"
                );
                return response.status(500).json(new InternalServerError());
            }

            const rawSeriesId = Number(request.params.id);
            const validation = seriesValidations.inactivate({
                id: rawSeriesId
            });
            if (!validation.success)
                return response
                    .status(400)
                    .json(new ValidationError(handleZodError(validation.error)));

            const { id: seriesId } = validation.data;
            const doesSeriesExist = await prisma.series.findFirst({
                select: {
                    id: true
                },

                where: {
                    id: seriesId,
                    deletedAt: null
                }
            });
            if (!doesSeriesExist)
                return response.status(404).json(new NotFoundError("Series not found"));

            await prisma.series.update({
                data: {
                    deletedAt: new Date()
                },

                where: {
                    id: seriesId
                }
            });

            return response.sendStatus(204);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

export { seriesRoutes };