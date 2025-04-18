import { z } from "zod";

// Interface defining the structure of a URL object
interface Url {
    originalUrl: string;
    shortUrl?: string;
    description?: string;
    createdBy?: string;
    isPasswordProtected?: boolean;
    password?: string;
}

export const urlSchemaZod = z.object({
    originalUrl: z
        .string({
            required_error: "Original URL is required.",
        })
        .min(1, "Original URL cannot be empty.")
        .url("Invalid URL format."),
    description: z
        .string()
        .max(200, "Description cannot exceed 200 characters.")
        .optional(),

    isPasswordProtected: z.preprocess(
        (val) => {
            if (typeof val === "string") {
                if (val.toLowerCase() === "true") return true;
                if (val.toLowerCase() === "false") return false;
            }
            return val;
        },
        z
            .boolean({
                invalid_type_error:
                    "Password protection flag must be a boolean (or 'true'/'false').",
            })
            .optional()
            .default(false)
    ),
    password: z.string().optional(),
});

export type urlData = z.infer<typeof urlSchemaZod>;
