import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(200, "Task title must be 200 characters or less"),

  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),

  priority: z.enum(["low", "medium", "high"]).default("medium"),

  scheduledDate: z.string().date().optional(),

  dueDate: z.string().date().optional(),

  categoryId: z.uuid().optional(),

  goalId: z.uuid().optional(),

  milestoneId: z.uuid().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
