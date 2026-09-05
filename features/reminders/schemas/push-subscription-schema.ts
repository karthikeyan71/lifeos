import { z } from "zod";

/**
 * Shape of the object returned by the browser's `PushSubscription.toJSON()`.
 * Only the fields we persist are validated.
 */
export const pushSubscriptionSchema = z.object({
  endpoint: z.url().max(2000),
  keys: z.object({
    p256dh: z.string().min(1).max(500),
    auth: z.string().min(1).max(500),
  }),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

/** IANA timezone string, e.g. "Asia/Kolkata". */
export const timezoneSchema = z.string().trim().min(1).max(100);
