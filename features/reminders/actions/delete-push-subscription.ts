"use server";

import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

/**
 * Removes this browser's push subscription. Scoped to the authenticated user so
 * one account can never delete another's row.
 */
export async function deletePushSubscription(endpoint: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  if (typeof endpoint !== "string" || endpoint.length === 0) {
    return { success: false as const, error: "Invalid subscription" };
  }

  try {
    await db
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.endpoint, endpoint),
          eq(pushSubscriptions.userId, user.id),
        ),
      );

    return { success: true as const };
  } catch {
    return { success: false as const, error: "Could not remove your subscription" };
  }
}
