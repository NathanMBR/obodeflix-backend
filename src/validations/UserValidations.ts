import { z as zod } from "zod";

export class UserValidations {
    create(userData: any) {
        /* eslint-disable camelcase */
        const createUserSchema = zod.object(
            {
                name: zod
                    .string(
                        {
                            required_error: "The name is required",
                            invalid_type_error: "The name must be a string",
                            description: "The user name"
                        }
                    )
                    .min(3, "The name must have a minimum of 3 characters")
                    .max(255, "The name must have a maximum of 255 characters"),

                email: zod
                    .string(
                        {
                            required_error: "The email is required",
                            invalid_type_error: "The email must be a string",
                            description: "The user email"
                        }
                    )
                    .email("The email must be in a valid format")
                    .max(255, "The email must have a maximum of 255 characters"),

                password: zod
                    .string(
                        {
                            required_error: "The password is required",
                            invalid_type_error: "The password must be a string",
                            description: "The user password"
                        }
                    )
                    .min(8, "The password must have a minimum of 8 characters")
            }
        );
        /* eslint-enable camelcase */

        return createUserSchema.safeParse(userData);
    }
}