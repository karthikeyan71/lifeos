"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { pushSubscriptionSchema } from "../schemas/push-subscription-schema";

/**
 * Registers this browser's push subscription for the authenticated user. The
 * endpoint is globally unique, so re-subscribing the same browser (or a browser
 * that was previously another user's) just rewrites the row.
 */
export async function savePushSubscription(input: unknown) {
  const parsed = pushSubscriptionSchema.safeParse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  if (!parsed.success) {
    return { success: false as const, error: "Invalid subscription" };
  }

  const userAgent = (await headers()).get("user-agent")?.slice(0, 500) ?? null;

  try {
    await db
      .insert(pushSubscriptions)
      .values({
        userId: user.id,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
        userAgent,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          userId: user.id,
          p256dh: parsed.data.keys.p256dh,
          auth: parsed.data.keys.auth,
          userAgent,
        },
      });

    return { success: true as const };
  } catch {
    return { success: false as const, error: "Could not save your subscription" };
  }
}
