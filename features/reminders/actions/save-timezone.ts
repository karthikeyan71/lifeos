"use server";

import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { timezoneSchema } from "../schemas/push-subscription-schema";

/**
 * Persists the browser's IANA timezone for the authenticated user. Used when
 * wording reminder notifications. Silently a no-op if the value is unchanged.
 */
export async function saveTimezone(input: unknown) {
  const parsed = timezoneSchema.safeParse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  if (!parsed.success) {
    return { success: false as const, error: "Invalid timezone" };
  }

  try {
    await db
      .update(users)
      .set({ timezone: parsed.data, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return { success: true as const };
  } catch {
    return { success: false as const, error: "Could not save your timezone" };
  }
}
