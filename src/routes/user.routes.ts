import { Router } from "express";
import {
    hash,
    compare
} from "bcryptjs";
import { sign } from "jsonwebtoken";

import { prisma } from "@/database";
import { UserValidations } from "@/validations";
import {
    ValidationError,
    InternalServerError
} from "@/errors";
import { SECRET } from "@/config";
import {
    handleZodError,
    handleControllerError,
    removeProperty
} from "@/helpers";
import { ensureAuthentication } from "@/middlewares";

const userRoutes = Router();

const userValidations = new UserValidations();

userRoutes.post(
    "/user/create",
    async (request, response) => {
        try {
            const rawUserData = request.body;

            const validation = userValidations.create(rawUserData);
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const userData = validation.data;

            const password = await hash(userData.password, 16);

            const user = await prisma.user.create(
                {
                    data: {
                        ...userData,
                        password,
                        type: "COMMON"
                    }
                }
            );

            return response.status(201).json(user);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

userRoutes.post(
    "/user/authenticate",
    async (request, response) => {
        try {
            const emailOrPasswordInvalidMessage = "The email or password is invalid";
            const rawUserData = request.body;

            const validation = userValidations.authenticate(rawUserData);
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const userData = validation.data;

            const doesUserExists = await prisma.user.findFirst(
                {
                    where: {
                        email: userData.email,
                        deletedAt: null
                    }
                }
            );

            if (!doesUserExists)
                return response.status(400).json(
                    new ValidationError([emailOrPasswordInvalidMessage])
                );

            const doesPasswordMatch = await compare(userData.password, doesUserExists.password);
            if (!doesPasswordMatch)
                return response.status(400).json(
                    new ValidationError([emailOrPasswordInvalidMessage])
                );

            const token = sign(
                {
                    sub: doesUserExists.id
                },

                SECRET,

                {
                    expiresIn: "7d"
                }
            );

            const user = removeProperty(doesUserExists, "password");

            return response.status(200).json(
                {
                    token,
                    user
                }
            );
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

userRoutes.get(
    "/user/get",
    ensureAuthentication,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at update user route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const userId = authenticationData.sub;
            const userData = request.body;

            const validation = userValidations.update(userData);
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const unsafeUser = await prisma.user.findFirst(
                {
                    where: {
                        id: userId,
                        deletedAt: null
                    }
                }
            );
            if (!unsafeUser) {
                /* eslint-disable-next-line no-console */
                console.error("Expected existent user at update user route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const user = removeProperty(unsafeUser, "password");

            return response.status(200).json(user);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

userRoutes.put(
    "/user/update",
    ensureAuthentication,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at update user route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const userId = authenticationData.sub;
            const userData = request.body;

            const validation = userValidations.update(userData);
            if (!validation.success)
                return response.status(400).json(
                    new ValidationError(handleZodError(validation.error))
                );

            const doesUserExist = await prisma.user.findFirst(
                {
                    where: {
                        id: userId,
                        deletedAt: null
                    }
                }
            );
            if (!doesUserExist) {
                /* eslint-disable-next-line no-console */
                console.error("Expected existent user at update user route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const unsafeUser = await prisma.user.update(
                {
                    where: {
                        id: userId
                    },

                    data: validation.data
                }
            );

            const user = removeProperty(unsafeUser, "password");

            return response.status(200).json(user);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

userRoutes.delete(
    "/user/delete",
    ensureAuthentication,
    async (request, response) => {
        try {
            const authenticationData = request.user;
            if (!authenticationData) {
                /* eslint-disable-next-line no-console */
                console.error("Expected user authentication at delete user route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            const userId = authenticationData.sub;

            const doesUserExist = await prisma.user.findFirst(
                {
                    where: {
                        id: userId,
                        deletedAt: null
                    }
                }
            );
            if (!doesUserExist) {
                /* eslint-disable-next-line no-console */
                console.error("Expected existent user at delete user route");
                return response.status(500).json(
                    new InternalServerError()
                );
            }

            await prisma.user.update(
                {
                    where: {
                        id: userId
                    },

                    data: {
                        deletedAt: new Date()
                    }
                }
            );

            return response.sendStatus(204);
        } catch (error) {
            return handleControllerError(error, response);
        }
    }
);

export { userRoutes };