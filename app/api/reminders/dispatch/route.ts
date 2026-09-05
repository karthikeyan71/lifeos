import { dispatchDueReminders } from "@/features/reminders/lib/dispatch";

/**
 * Reminder delivery worker. Meant to be hit on a schedule (Vercel Cron, an
 * external cron, etc.). Protected by a shared secret so it can live outside the
 * authenticated `/dashboard` area.
 *
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Vercel Cron sends this header automatically when `CRON_SECRET` is set.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function handle(request: Request) {
  if (!authorized(request)) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await dispatchDueReminders();
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error("[reminders/dispatch]", error);
    return Response.json({ success: false, error: "Dispatch failed" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
