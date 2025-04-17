import { z } from "zod";

export const visitedHistoryZodSchema = z.object({
    shortUrlId: z.string().optional(),
    ipAddress: z.string().ip(),
    deviceType: z.string(),
    clickedTime: z.date().optional(),
});

export type visitedHistoryData = z.infer<typeof visitedHistoryZodSchema>;
