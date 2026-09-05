import { z } from "zod";

export const createGoalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Goal title is required")
    .max(200, "Goal title must be 200 characters or less"),

  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),

  status: z.enum(["active", "completed", "cancelled"]).default("active"),

  startDate: z.string().date().optional(),

  targetDate: z.string().date().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
