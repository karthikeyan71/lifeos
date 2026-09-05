import { cache } from "react";
import { createClient } from "./server";

/**
 * The authenticated user for the current request. Wrapped in React `cache()` so
 * the layout, the page, and any queries in one render share a single
 * `supabase.auth.getUser()` round-trip instead of calling it repeatedly.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
