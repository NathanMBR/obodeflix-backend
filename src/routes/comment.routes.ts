import { Router } from "express";

import { ensureAuthentication } from "@/middlewares";
import { prisma } from "@/database";
import { CommentValidations } from "@/validations";
import {
    ValidationError,
    NotFoundError,
    InternalServerError
} from "@/errors";
import {
    handleZodError,
    handleControllerError
} from "@/helpers";

const commentRoutes = Router();

const commentValidations = new CommentValidations();

commentRoutes.post(
    "/comment/create",
    ensureAuthentication,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at create comment route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const rawCommentData = request.body;

            const validation = commentValidations.create(rawCommentData);
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const relationsCount = Object.entries(validation.data)
                .filter(
                    ([key]) => key.endsWith("Id")
                )
                .reduce(
                    (previous, [_, value]) => !!value
                        ? previous + 1
                        : 0,
                    0
                );

            if (relationsCount !== 1)
                return response.status(400).json(
                    new ValidationError(["The comment must have exactly one relation"])
                );

            const {
                body,
                parentId,
                seriesId,
                episodeId
            } = validation.data;

            if (parentId) {
                const parentComment = await prisma.comment.findFirst(
                    {
                        where: {
                            id: parentId,
                            deletedAt: null
                        },

                        select: {
                            id: true,
                            parentId: true,
                            deletedAt: true
                        }
                    }
                );

                if (!parentComment)
                    return response.status(404).json(
                        new NotFoundError("Parent comment ID not found")
                    );

                if (parentComment.parentId)
                    return response.status(400).json(
                        new ValidationError(["The target parent comment is already a reply; please answer the parent comment instead"])
                    );
            }

            if (seriesId) {
                const series = await prisma.series.findFirst(
                    {
                        where: {
                            id: seriesId,
                            deletedAt: null
                        },

                        select: {
                            id: true
                        }
                    }
                );

                if (!series)
                    return response.status(404).json(
                        new NotFoundError("Series ID not found")
                    );
            }

            if (episodeId) {
                const episode = await prisma.episode.findFirst(
                    {
                        where: {
                            id: episodeId,
                            deletedAt: null
                        },

                        select: {
                            id: true
                        }
                    }
                );

                if (!episode)
                    return response.status(404).json(
                        new NotFoundError("Episode ID not found")
                    );
            }

            const comment = await prisma.comment.create(
                {
                    data: {
                        body,
                        parentId,
                        seriesId,
                        episodeId,
                        userId: authenticationData.sub
                    }
                }
            );

            return response.status(201).json(comment);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

commentRoutes.put(
    "/comment/update/:id",
    ensureAuthentication,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at create comment route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const rawCommentId = Number(request.params.id);
            const rawCommentData = request.body;
            rawCommentData.id = rawCommentId;

            const validation = commentValidations.update(rawCommentData);
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const relationsCount = Object.entries(validation.data)
                .filter(
                    ([key]) => key.endsWith("Id")
                )
                .reduce(
                    (previous, [_, value]) => !!value
                        ? previous + 1
                        : 0,
                    0
                );

            if (relationsCount !== 1)
                return response.status(400).json(
                    new ValidationError(["The comment must have exactly one relation"])
                );

            const {
                id: commentId,
                body,
                parentId,
                seriesId,
                episodeId
            } = validation.data;

            if (parentId) {
                const parentComment = await prisma.comment.findFirst(
                    {
                        where: {
                            id: parentId,
                            deletedAt: null
                        },

                        select: {
                            id: true,
                            parentId: true,
                            deletedAt: true
                        }
                    }
                );

                if (!parentComment)
                    return response.status(404).json(
                        new NotFoundError("Parent comment ID not found")
                    );

                if (parentComment.parentId)
                    return response.status(400).json(
                        new ValidationError(["The target parent comment is already a reply; please answer the parent comment instead"])
                    );
            }

            if (seriesId) {
                const series = await prisma.series.findFirst(
                    {
                        where: {
                            id: seriesId,
                            deletedAt: null
                        },

                        select: {
                            id: true
                        }
                    }
                );

                if (!series)
                    return response.status(404).json(
                        new NotFoundError("Series ID not found")
                    );
            }

            if (episodeId) {
                const episode = await prisma.episode.findFirst(
                    {
                        where: {
                            id: episodeId,
                            deletedAt: null
                        },

                        select: {
                            id: true
                        }
                    }
                );

                if (!episode)
                    return response.status(404).json(
                        new NotFoundError("Episode ID not found")
                    );
            }

            const commentToUpdate = await prisma.comment.findFirst(
                {
                    where: {
                        id: commentId,
                        deletedAt: null
                    },

                    select: {
                        id: true,
                        userId: true,
                        deletedAt: true
                    }
                }
            );

            if (!commentToUpdate || commentToUpdate.userId !== authenticationData.sub)
                return response.status(404).json(
                    new NotFoundError("Comment ID not found")
                );

            const comment = await prisma.comment.update(
                {
                    data: {
                        body,
                        parentId,
                        seriesId,
                        episodeId,
                        userId: authenticationData.sub
                    },

                    where: {
                        id: commentId
                    }
                }
            );

            return response.status(200).json(comment);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

commentRoutes.delete(
    "/comment/inactivate/:id",
    ensureAuthentication,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at create comment route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const rawCommentId = Number(request.params.id);

            const validation = commentValidations.update(
                {
                    id: rawCommentId
                }
            );
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const { id: commentId } = validation.data;

            const commentToInactivate = await prisma.comment.findFirst(
                {
                    where: {
                        id: commentId,
                        deletedAt: null
                    },

                    select: {
                        id: true,
                        userId: true,
                        deletedAt: true
                    }
                }
            );

            if (!commentToInactivate || commentToInactivate.userId !== authenticationData.sub)
                return response.status(404).json(
                    new NotFoundError("Comment ID not found")
                );

            await prisma.comment.update(
                {
                    select: {
                        id: true
                    },

                    data: {
                        deletedAt: new Date()
                    },

                    where: {
                        id: commentId
                    }
                }
            );

            return response.sendStatus(204);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

export { commentRoutes };