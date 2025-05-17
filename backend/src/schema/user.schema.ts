import { z } from "zod";

export const createUserSchemaZod = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(20, "Username must be at most 20 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    refreshToken: z.string().jwt().optional(),
    createdShortUrl: z.string().optional(),
});

export type createUserData = z.infer<typeof createUserSchemaZod>;

export const loginUserSchemaZod = z.object({
    email: z.string().email({
        message: "Invalid email id",
    }),
    password: z.string(),
});

export type userLoginData = z.infer<typeof loginUserSchemaZod>;
