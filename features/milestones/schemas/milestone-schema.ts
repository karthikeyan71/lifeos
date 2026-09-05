import { z } from "zod";

export const createMilestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Milestone title is required")
    .max(200, "Milestone title must be 200 characters or less"),

  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),

  status: z.enum(["todo", "in_progress", "completed", "cancelled"]).default("todo"),

  startDate: z.string().date().optional(),

  targetDate: z.string().date().optional(),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
