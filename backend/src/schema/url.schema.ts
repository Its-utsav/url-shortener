import { z } from "zod";
import { userSchemaZod } from "./user.schema";

const urlSchema = z.object({
    originalUrl: z.string({
        required_error: "Original Url Must needed",
    }),
    shortUrl: z.string(),
    createdBy: userSchemaZod,
    description: z
        .string()
        .max(200, "Maximum description length should be 200 characters")
        .optional(),
    totalClicks: z.number().min(0).default(0),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type urlData = z.infer<typeof urlSchema>;
