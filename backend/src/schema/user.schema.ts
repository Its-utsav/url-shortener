import { z } from "zod";

interface User {
    // _id: ObjectId;
    username: string;
    email: string;
    password: string;
    refreshToken?: string;
    createdShortUrl: string;
}

export const userSchemaZod = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(20, "Username must be at most 20 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    refreshToken: z.string().jwt(),
    createdShortUrl: z.string().optional(),
});

export type userData = z.infer<typeof userSchemaZod>;
