import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions, users } from "@/db/schema";
import { isPushConfigured } from "../lib/web-push";

/**
 * Server-side snapshot for the Settings page: whether push is configured at all,
 * how many browsers this user has registered, and their stored timezone.
 */
export async function getNotificationSettings(userId: string) {
  const [subRows, userRows] = await Promise.all([
    db
      .select({ value: count() })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId)),
    db
      .select({ timezone: users.timezone })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
  ]);

  return {
    pushConfigured: isPushConfigured,
    deviceCount: subRows[0]?.value ?? 0,
    timezone: userRows[0]?.timezone ?? null,
  };
}
