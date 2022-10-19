import { Router } from "express";
import { hash } from "bcryptjs";

import { UserRepository } from "@/repositories";
import { UserValidations } from "@/validations";
import { ValidationError } from "@/errors";
import {
    handleZodError,
    handleControllerError
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

export { userRoutes };