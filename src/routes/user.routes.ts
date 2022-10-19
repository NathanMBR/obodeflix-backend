import { Router } from "express";
import {
    hash,
    compare
} from "bcryptjs";
import { sign } from "jsonwebtoken";

import { UserRepository } from "@/repositories";
import { prisma } from "@/database";
import { UserValidations } from "@/validations";
import { ValidationError } from "@/errors";
import { SECRET } from "@/config";
import {
    handleZodError,
    handleControllerError,
    removeProperty
} from "@/helpers";

const userRoutes = Router();

const userValidations = new UserValidations();
const userRepository = new UserRepository();

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

            const user = await userRepository.create(
                {
                    ...userData,
                    password,
                    type: "COMMON"
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

export { userRoutes };