"use server";

import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { isPushConfigured, sendPush } from "../lib/web-push";

/**
 * Sends a "notifications are working" push to every browser the authenticated
 * user has registered. Prunes any subscription the push service reports as gone.
 */
export async function sendTestNotification() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  if (!isPushConfigured) {
    return { success: false as const, error: "Push notifications are not configured on the server" };
  }

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, user.id));

  if (subs.length === 0) {
    return { success: false as const, error: "This device isn't subscribed yet" };
  }

  let delivered = 0;

  for (const sub of subs) {
    const result = await sendPush(
      { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
      {
        title: "LifeOS",
        body: "Test notification — reminders are set up correctly.",
        url: "/dashboard/settings",
        tag: "lifeos-test",
      },
    );

    if (result.ok) {
      delivered += 1;
    } else if (result.gone) {
      await db
        .delete(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.endpoint, sub.endpoint),
            eq(pushSubscriptions.userId, user.id),
          ),
        );
    }
  }

  if (delivered === 0) {
    return { success: false as const, error: "Could not deliver to any of your devices" };
  }

  return { success: true as const, delivered };
}
