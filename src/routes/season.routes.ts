import { Router } from "express";

import { ensureAuthentication, ensureModeration } from "@/middlewares";
import { prisma } from "@/database";
import { SeasonValidations } from "@/validations";
import {
    ValidationError,
    NotFoundError,
    InternalServerError
} from "@/errors";
import {
    handleZodError,
    handleControllerError,
    getPaginatedData
} from "@/helpers";

const seasonRoutes = Router();

const seasonValidations = new SeasonValidations();

seasonRoutes.post(
    "/season/create",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at create season route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const rawSeasonData = request.body;

            const validation = seasonValidations.create(rawSeasonData);
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const {
                name,
                description,
                type,
                seriesId,
                position,
                imageAddress,
                excludeFromMostRecent
            } = validation.data;

            const [
                doesSeriesIdExist,
                isPositionAlreadyUsed
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

                    prisma.season.findFirst(
                        {
                            select: {
                                id: true
                            },

                            where: {
                                seriesId,
                                position,
                                deletedAt: null,

                                series: {
                                    deletedAt: null
                                }
                            }
                        }
                    )
                ]
            );

            if (!doesSeriesIdExist)
                return response.status(404).json(
                    new NotFoundError("Series ID not found")
                );

            if (isPositionAlreadyUsed)
                return response.status(400).json(
                    new ValidationError(["The given series already has a season at this position"])
                );

            const season = await prisma.season.create(
                {
                    data: {
                        name,
                        description,
                        type,
                        position,
                        imageAddress,
                        excludeFromMostRecent: !!excludeFromMostRecent,

                        series: {
                            connect: {
                                id: seriesId
                            }
                        }
                    }
                }
            );

            return response.status(201).json(season);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

seasonRoutes.get(
    "/season/get/:id",
    async (request, response) => {
        try {
            const rawSeasonId = Number(request.params.id);

            const validation = seasonValidations.findOne(
                {
                    id: rawSeasonId
                }
            );
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const { id: seasonId } = validation.data;

            const season = await prisma.season.findFirst(
                {
                    where: {
                        id: seasonId,
                        deletedAt: null,

                        series: {
                            deletedAt: null
                        }
                    },

                    include: {
                        series: true
                    }
                }
            );

            if (!season)
                return response.status(404).json(
                    new NotFoundError("Season not found")
                );

            return response.status(200).json(season);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

seasonRoutes.get(
    "/season/all",
    async (request, response) => {
        try {
            const rawPaginationData = {
                page: Number(request.query.page),
                quantity: Number(request.query.quantity),
                orderColumn: String(request.query.orderColumn),
                orderBy: String(request.query.orderBy),
                search: String(request.query.search || ""),
                seriesId: Number(request.query.seriesId)
            };

            const {
                take,
                skip,
                orderColumn,
                orderBy,
                search,
                seriesId
            } = seasonValidations.findAll(rawPaginationData);

            const [
                seasons,
                seasonsCount
            ] = await Promise.all(
                [
                    prisma.season.findMany(
                        {
                            take,
                            skip,

                            where: {
                                name: {
                                    contains: search,
                                    mode: "insensitive"
                                },

                                series: {
                                    id: seriesId,
                                    deletedAt: null
                                },

                                deletedAt: null
                            },

                            orderBy: {
                                [orderColumn]: orderBy
                            }
                        }
                    ),

                    prisma.season.count(
                        {
                            where: {
                                name: {
                                    contains: search,
                                    mode: "insensitive"
                                },

                                series: {
                                    id: seriesId,
                                    deletedAt: null
                                },

                                deletedAt: null
                            }
                        }
                    )
                ]
            );

            const paginatedSeasons = getPaginatedData(
                {
                    take,
                    skip,
                    count: seasonsCount,
                    data: seasons
                }
            );

            return response.status(200).json(paginatedSeasons);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

seasonRoutes.put(
    "/season/update/:id",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at update season route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const rawSeasonId = Number(request.params.id);
            const rawSeasonData = request.body;
            rawSeasonData.id = rawSeasonId;

            const validation = seasonValidations.update(rawSeasonData);
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const {
                id: seasonId,
                name,
                description,
                type,
                seriesId,
                position,
                imageAddress,
                excludeFromMostRecent
            } = validation.data;

            const [
                doesSeasonExist,
                doesSeriesIdExist,
                isPositionAlreadyUsed
            ] = await Promise.all(
                [
                    prisma.season.findFirst(
                        {
                            select: {
                                id: true
                            },

                            where: {
                                id: seasonId,
                                deletedAt: null,

                                series: {
                                    deletedAt: null
                                }
                            }
                        }
                    ),

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

                    prisma.season.findFirst(
                        {
                            select: {
                                id: true
                            },

                            where: {
                                id: {
                                    not: seasonId
                                },
                                seriesId,
                                position,
                                deletedAt: null,

                                series: {
                                    deletedAt: null
                                }
                            }
                        }
                    )
                ]
            );

            if (!doesSeasonExist)
                return response.status(404).json(
                    new NotFoundError("Season ID not found")
                );

            if (!doesSeriesIdExist)
                return response.status(404).json(
                    new NotFoundError("Series ID not found")
                );

            if (isPositionAlreadyUsed)
                return response.status(400).json(
                    new ValidationError(["The given series already has a season at this position"])
                );

            const season = await prisma.season.update(
                {
                    data: {
                        name,
                        description,
                        type,
                        position,
                        imageAddress,
                        excludeFromMostRecent: !!excludeFromMostRecent,

                        series: {
                            connect: {
                                id: seriesId
                            }
                        }
                    },

                    where: {
                        id: seasonId
                    }
                }
            );

            return response.status(200).json(season);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

seasonRoutes.delete(
    "/season/inactivate/:id",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at inactivate season route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const rawSeasonId = Number(request.params.id);

            const validation = seasonValidations.inactivate(
                {
                    id: rawSeasonId
                }
            );
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const { id: seasonId } = validation.data;
            const doesSeasonExist = await prisma.season.findFirst(
                {
                    select: {
                        id: true
                    },

                    where: {
                        id: seasonId,
                        deletedAt: null,

                        series: {
                            deletedAt: null
                        }
                    }
                }
            );

            if (!doesSeasonExist)
                return response.status(404).json(
                    new NotFoundError("Season not found")
                );

            const season = await prisma.season.update(
                {
                    data: {
                        deletedAt: new Date()
                    },

                    where: {
                        id: seasonId
                    }
                }
            );

            return response.status(200).json(season);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

seasonRoutes.get(
    "/season/recent",
    async (request, response) => {
        try {
            const rawPaginationData = {
                page: Number(request.query.page),
                quantity: Number(request.query.quantity),
                orderColumn: "id",
                orderBy: "desc",
                search: String(request.query.search || ""),
                seriesId: Number(request.query.seriesId)
            };

            const {
                take,
                skip,
                orderColumn,
                orderBy,
                search,
                seriesId
            } = seasonValidations.findAll(rawPaginationData);

            const [
                seasons,
                seasonsCount
            ] = await Promise.all(
                [
                    prisma.season.findMany(
                        {
                            take,
                            skip,

                            where: {
                                name: {
                                    contains: search,
                                    mode: "insensitive"
                                },

                                series: {
                                    id: seriesId,
                                    deletedAt: null
                                },

                                excludeFromMostRecent: false,

                                deletedAt: null
                            },

                            orderBy: {
                                [orderColumn]: orderBy
                            }
                        }
                    ),

                    prisma.season.count(
                        {
                            where: {
                                name: {
                                    contains: search,
                                    mode: "insensitive"
                                },

                                series: {
                                    id: seriesId,
                                    deletedAt: null
                                },

                                excludeFromMostRecent: false,

                                deletedAt: null
                            }
                        }
                    )
                ]
            );

            const paginatedSeasons = getPaginatedData(
                {
                    take,
                    skip,
                    count: seasonsCount,
                    data: seasons
                }
            );

            return response.status(200).json(paginatedSeasons);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

export { seasonRoutes };