import { Router } from "express";

import {
    ensureAuthentication,
    ensureModeration
} from "@/middlewares";
import { prisma } from "@/database";
import { EpisodeValidations } from "@/validations";
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

const episodeRoutes = Router();

const episodeValidations = new EpisodeValidations();

episodeRoutes.post(
    "/episode/create",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at create episode route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const rawEpisodeData = request.body;

            const validation = episodeValidations.create(rawEpisodeData);
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const {
                name,
                seasonId,
                duration,
                path,
                position
            } = validation.data;

            const [
                doesSeasonIdExist,
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
                                deletedAt: null
                            }
                        }
                    ),

                    prisma.episode.findFirst(
                        {
                            select: {
                                id: true
                            },

                            where: {
                                seasonId,
                                position,
                                deletedAt: null
                            }
                        }
                    )
                ]
            );

            if (!doesSeasonIdExist)
                return response.status(404).json(
                    new NotFoundError("The season ID does not exist")
                );

            if (isPositionAlreadyUsed)
                return response.status(400).json(
                    new ValidationError(["The position is already used"])
                );

            const episode = await prisma.episode.create(
                {
                    data: {
                        name,
                        duration,
                        path,
                        position,
                        season: {
                            connect: {
                                id: seasonId
                            }
                        }
                    }
                }
            );

            return response.status(201).json(episode);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

episodeRoutes.get(
    "/episode/get/:id",
    async (request, response) => {
        try {
            const rawEpisodeId = Number(request.params.id);

            const validation = episodeValidations.findOne(
                {
                    id: rawEpisodeId
                }
            );
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const { id: episodeId } = validation.data;

            const episode = await prisma.episode.findFirst(
                {
                    where: {
                        id: episodeId,
                        deletedAt: null
                    }
                }
            );
            if (!episode)
                return response.status(404).json(
                    new NotFoundError("Episode ID not found")
                );

            return response.status(200).json(episode);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

episodeRoutes.get(
    "/episode/all",
    async (request, response) => {
        try {
            const rawPaginationData = {
                page: Number(request.query.page),
                quantity: Number(request.query.quantity),
                orderColumn: String(request.query.orderColumn),
                orderBy: String(request.query.orderBy),
                search: String(request.query.search || "")
            };

            const {
                take,
                skip,
                orderColumn,
                orderBy,
                search
            } = episodeValidations.findAll(rawPaginationData);

            const [
                episodes,
                episodesCount
            ] = await Promise.all(
                [
                    prisma.episode.findMany(
                        {
                            take,
                            skip,

                            where: {
                                name: {
                                    contains: search
                                },

                                deletedAt: null
                            },

                            orderBy: {
                                [orderColumn]: orderBy
                            }
                        }
                    ),

                    prisma.episode.count(
                        {
                            where: {
                                name: {
                                    contains: search
                                },

                                deletedAt: null
                            }
                        }
                    )
                ]
            );

            const paginatedEpisodes = getPaginatedData(
                {
                    take,
                    skip,
                    count: episodesCount,
                    data: episodes
                }
            );

            return response.status(200).json(paginatedEpisodes);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

episodeRoutes.put(
    "/episode/update/:id",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at update episode route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const rawEpisodeId = Number(request.params.id);
            const rawEpisodeData = request.body;
            rawEpisodeData.id = rawEpisodeId;

            const validation = episodeValidations.update(rawEpisodeData);
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const {
                id: episodeId,
                name,
                seasonId,
                duration,
                path,
                position
            } = validation.data;

            const [
                doesEpisodeExist,
                doesSeasonIdExist,
                isPositionAlreadyUsed
            ] = await Promise.all(
                [
                    prisma.episode.findFirst(
                        {
                            select: {
                                id: true
                            },

                            where: {
                                id: episodeId,
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
                                id: seasonId,
                                deletedAt: null
                            }
                        }
                    ),

                    prisma.episode.findFirst(
                        {
                            select: {
                                id: true
                            },

                            where: {
                                id: {
                                    not: episodeId
                                },
                                seasonId,
                                position,
                                deletedAt: null
                            }
                        }
                    )
                ]
            );

            if (!doesEpisodeExist)
                return response.status(404).json(
                    new NotFoundError("Episode ID not found")
                );

            if (!doesSeasonIdExist)
                return response.status(404).json(
                    new NotFoundError("Season ID not found")
                );

            if (isPositionAlreadyUsed)
                return response.status(400).json(
                    new ValidationError(["The given season already has an episode at this position"])
                );

            const episode = await prisma.episode.update(
                {
                    where: {
                        id: episodeId
                    },

                    data: {
                        name,
                        duration,
                        path,
                        position,
                        season: {
                            connect: {
                                id: seasonId
                            }
                        }
                    }
                }
            );

            return response.status(200).json(episode);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

episodeRoutes.delete(
    "/episode/inactivate/:id",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at inactivate episode route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const rawEpisodeId = Number(request.params.id);

            const validation = episodeValidations.inactivate(
                {
                    id: rawEpisodeId
                }
            );
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const { id: episodeId } = validation.data;

            const doesEpisodeExist = await prisma.episode.findFirst(
                {
                    select: {
                        id: true
                    },

                    where: {
                        id: episodeId,
                        deletedAt: null
                    }
                }
            );
            if (!doesEpisodeExist)
                return response.status(404).json(
                    new NotFoundError("Episode ID not found")
                );

            await prisma.episode.update(
                {
                    select: {
                        id: true
                    },

                    data: {
                        deletedAt: new Date()
                    },

                    where: {
                        id: episodeId
                    }
                }
            );

            return response.sendStatus(204);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

export { episodeRoutes };