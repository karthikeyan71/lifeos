import { z } from "zod";

export const createHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Habit name is required")
    .max(200, "Habit name must be 200 characters or less"),

  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),

  frequency: z.enum(["daily", "weekly"]).default("daily"),

  categoryId: z.uuid().optional(),

  startDate: z.string().date().optional(),

  endDate: z.string().date().optional(),

  isActive: z.boolean().default(true),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;

export const setOccurrenceSchema = z.object({
  habitId: z.uuid(),

  date: z.string().date(),

  // null clears the logged occurrence for that date
  status: z.enum(["completed", "missed", "skipped"]).nullable(),
});

export type SetOccurrenceInput = z.infer<typeof setOccurrenceSchema>;
