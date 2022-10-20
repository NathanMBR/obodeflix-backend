import { z as zod } from "zod";

/* eslint-disable camelcase */
export class SeriesValidations {
    create(seriesData: any) {
        const createSeriesSchema = zod.object(
            {
                mainName: zod
                    .string(
                        {
                            required_error: "The main name is required",
                            invalid_type_error: "The main name must be a string",
                            description: "The series main name"
                        }
                    )
                    .min(1, "The main name must have a minimum of 1 character")
                    .max(255, "The main name must have a maximum of 255 characters"),

                alternativeName: zod
                    .string(
                        {
                            invalid_type_error: "The alternative name must be a string",
                            description: "The series alternative name"
                        }
                    )
                    .min(1, "The alternative name must have a minimum of 1 character")
                    .max(255, "The alternative name must have a maximum of 255 characters")
                    .optional(),

                mainNameLanguage: zod
                    .enum(
                        [
                            "ENGLISH",
                            "JAPANESE"
                        ],

                        {
                            required_error: "The main name language is required",
                            invalid_type_error: "The main name language must be ENGLISH or JAPANESE",
                            description: "The series main name language"
                        }
                    ),

                description: zod
                    .string(
                        {
                            invalid_type_error: "The description must be a string",
                            description: "The series description"
                        }
                    )
                    .optional(),

                tags: zod
                    .array(
                        zod.number(
                            {
                                invalid_type_error: "The tag must be a number",
                                description: "The series tag"
                            }
                        ),

                        {
                            required_error: "The series tags are required",
                            invalid_type_error: "The series tags must be a number array",
                            description: "The series tags"
                        }
                    )
            }
        );

        return createSeriesSchema.safeParse(seriesData);
    }
}
/* eslint-enable camelcase */