import { z } from "zod";

interface Url {
    originalUrl: string;
    shortUrl: string;
    description?: string;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
    isPasswordProtected?: boolean;
    password?: string;
}

export const urlSchemaZod: z.ZodType<Url> = z.object({
    originalUrl: z
        .string({
            required_error: "Original Url Must needed",
        })
        .url("Invalid Url format"),
    shortUrl: z.string(),
    createdBy: z.string().optional(),
    description: z
        .string()
        .max(200, "Maximum description length should be 200 characters")
        .optional(),
    isPasswordProtected: z.boolean().optional().default(false),
    password: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type urlData = z.infer<typeof urlSchemaZod>;
