import { z } from "zod";

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
        z.boolean({
            invalid_type_error:
                "Password protection flag must be a boolean (or 'true'/'false').",
        }).default(false)
        // .optional()
    ),
    password: z.string().min(1, "Password can not be empty").optional(),
}).refine(
    (data) => {
        // password proctected but no password
        if (data.isPasswordProtected === true && !data.password)
            return false;

        // password given but isPasswordProtected is false
        if (data.password && data.isPasswordProtected !== true)
            return false;

        return true;
    },
    {
        message:
            "If setting password protection, password is required. If providing a password, isPasswordProtected must be true.",
        path: ["password", "isPasswordProtected"],
    }
);

export const updateUrlSchemaZod = z.object({
    description: z.string().optional(),
    isPasswordProtected: z.boolean().optional(),
    password: z.string().min(1, "Password can not be empty").optional(),
}).refine(
    (data) => {
        // password proctected but no password
        if (data.isPasswordProtected === true && !data.password)
            return false;

        // password given but isPasswordProtected is false
        if (data.password && data.isPasswordProtected !== true)
            return false;

        return true;
    },
    {
        message:
            "If setting password protection, password is required. If providing a password, isPasswordProtected must be true.",
        path: ["password", "isPasswordProtected"],
    }
);

export type urlData = z.infer<typeof urlSchemaZod>;
export type updatedUrlData = z.infer<typeof updateUrlSchemaZod>;
