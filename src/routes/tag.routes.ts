import { Router } from "express";

import {
    ensureAuthentication,
    ensureModeration
} from "@/middlewares";
import { prisma } from "@/database";
import { TagValidations } from "@/validations";
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

const tagRoutes = Router();

const tagValidations = new TagValidations();

tagRoutes.post(
    "/tag/create",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at create tag route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const rawTagData = request.body;
            const validation = tagValidations.create(rawTagData);
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const { name } = validation.data;

            const doesTagAlreadyExist = await prisma.tag.findFirst(
                {
                    select: {
                        id: true
                    },

                    where: {
                        name,
                        deletedAt: null
                    }
                }
            );

            if (doesTagAlreadyExist)
                return response.status(400).json(
                    new ValidationError(["Tag already exists"])
                );

            const tag = await prisma.tag.create(
                {
                    data: {
                        name
                    }
                }
            );

            return response.status(201).json(tag);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

tagRoutes.get(
    "/tag/get/:id",
    async (request, response) => {
        try {
            const rawTagId = Number(request.params.id);

            const validation = tagValidations.findOne(
                {
                    id: rawTagId
                }
            );
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const { id: tagId } = validation.data;

            const tag = await prisma.tag.findFirst(
                {
                    where: {
                        id: tagId,
                        deletedAt: null
                    }
                }
            );

            if (!tag)
                return response.status(404).json(
                    new NotFoundError("Tag not found")
                );

            return response.status(200).json(tag);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

tagRoutes.get(
    "/tag/all",
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
            } = tagValidations.findAll(rawPaginationData);

            const [
                tags,
                tagsCount
            ] = await Promise.all(
                [
                    prisma.tag.findMany(
                        {
                            take,
                            skip,

                            where: {
                                OR: [
                                    {
                                        name: {
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
                        }
                    ),

                    prisma.tag.count(
                        {
                            where: {
                                OR: [
                                    {
                                        name: {
                                            contains: search,
                                            mode: "insensitive"
                                        }
                                    }
                                ],

                                deletedAt: null
                            }
                        }
                    )
                ]
            );

            const paginatedTags = getPaginatedData(
                {
                    take,
                    skip,
                    count: tagsCount,
                    data: tags
                }
            );

            return response.status(200).json(paginatedTags);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

tagRoutes.put(
    "/tag/update/:id",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at update tag route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const rawTagId = Number(request.params.id);
            const rawTagData = request.body;
            rawTagData.id = rawTagId;

            const validation = tagValidations.update(rawTagData);
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const {
                id: tagId,
                name
            } = validation.data;

            const [
                doesTagExist,
                doesTagNameAlreadyExist
            ] = await Promise.all(
                [
                    prisma.tag.findFirst(
                        {
                            select: {
                                id: true
                            },

                            where: {
                                id: tagId,
                                deletedAt: null
                            }
                        }
                    ),

                    prisma.tag.findFirst(
                        {
                            select: {
                                id: true
                            },

                            where: {
                                NOT: {
                                    id: tagId
                                },
                                name,
                                deletedAt: null
                            }
                        }
                    )
                ]
            );

            if (!doesTagExist)
                return response.status(404).json(
                    new NotFoundError("Tag not found")
                );

            if (doesTagNameAlreadyExist)
                return response.status(400).json(
                    new ValidationError(["Tag name already exists"])
                );

            const tag = await prisma.tag.update(
                {
                    where: {
                        id: tagId
                    },

                    data: {
                        name
                    }
                }
            );

            return response.status(200).json(tag);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

tagRoutes.delete(
    "/tag/inactivate/:id",
    ensureAuthentication,
    ensureModeration,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at update tag route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const rawTagId = Number(request.params.id);
            const validation = tagValidations.inactivate(
                {
                    id: rawTagId
                }
            );
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const { id: tagId } = validation.data;

            const doesTagExist = await prisma.tag.findFirst(
                {
                    select: {
                        id: true
                    },

                    where: {
                        id: tagId,
                        deletedAt: null
                    }
                }
            );
            if (!doesTagExist)
                return response.status(404).json(
                    new NotFoundError("Tag not found")
                );

            await prisma.$transaction(
                [
                    prisma.seriesTags.updateMany(
                        {
                            where: {
                                tagId,
                                deletedAt: null
                            },

                            data: {
                                deletedAt: new Date()
                            }
                        }
                    ),

                    prisma.tag.update(
                        {
                            where: {
                                id: tagId
                            },

                            data: {
                                deletedAt: new Date()
                            }
                        }
                    )
                ]
            );

            return response.sendStatus(204);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

export { tagRoutes };