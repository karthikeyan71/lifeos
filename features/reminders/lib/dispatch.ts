import { and, inArray, isNotNull, lte } from "drizzle-orm";
import { db } from "@/db";
import { goals, habits, pushSubscriptions, tasks } from "@/db/schema";
import { isPushConfigured, sendPush, type PushPayload } from "./web-push";

type DueReminder = {
  userId: string;
  title: string;
  kind: "task" | "goal" | "habit";
  url: string;
};

/**
 * Delivers every reminder whose time has arrived, then clears it so it never
 * fires twice (matching the "one-shot ... cleared once sent" schema contract).
 *
 * A cutoff captured up front bounds the clear step to exactly the rows we looked
 * at, so reminders that come due mid-run are left for the next pass. Reminders
 * on already-finished tasks/goals or paused habits are cleared without a push.
 */
export async function dispatchDueReminders() {
  const cutoff = new Date();

  const taskDue = and(isNotNull(tasks.reminderAt), lte(tasks.reminderAt, cutoff));
  const goalDue = and(isNotNull(goals.reminderAt), lte(goals.reminderAt, cutoff));
  const habitDue = and(isNotNull(habits.reminderAt), lte(habits.reminderAt, cutoff));

  const [dueTasks, dueGoals, dueHabits] = await Promise.all([
    db
      .select({ userId: tasks.userId, title: tasks.title, status: tasks.status })
      .from(tasks)
      .where(taskDue),
    db
      .select({ userId: goals.userId, title: goals.title, status: goals.status })
      .from(goals)
      .where(goalDue),
    db
      .select({ userId: habits.userId, name: habits.name, isActive: habits.isActive })
      .from(habits)
      .where(habitDue),
  ]);

  const dueCount = dueTasks.length + dueGoals.length + dueHabits.length;

  // Always clear what we processed — even entries we choose not to send — so a
  // stale reminder can never accumulate.
  await Promise.all([
    dueTasks.length ? db.update(tasks).set({ reminderAt: null }).where(taskDue) : undefined,
    dueGoals.length ? db.update(goals).set({ reminderAt: null }).where(goalDue) : undefined,
    dueHabits.length ? db.update(habits).set({ reminderAt: null }).where(habitDue) : undefined,
  ]);

  const reminders: DueReminder[] = [
    ...dueTasks
      .filter((t) => t.status !== "completed" && t.status !== "cancelled")
      .map((t): DueReminder => ({ userId: t.userId, title: t.title, kind: "task", url: "/dashboard/tasks" })),
    ...dueGoals
      .filter((g) => g.status === "active")
      .map((g): DueReminder => ({ userId: g.userId, title: g.title, kind: "goal", url: "/dashboard/goals" })),
    ...dueHabits
      .filter((h) => h.isActive)
      .map((h): DueReminder => ({ userId: h.userId, title: h.name, kind: "habit", url: "/dashboard/habits" })),
  ];

  if (reminders.length === 0 || !isPushConfigured) {
    return { due: dueCount, sent: 0, notified: 0, pruned: 0, pushConfigured: isPushConfigured };
  }

  const userIds = [...new Set(reminders.map((r) => r.userId))];

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(inArray(pushSubscriptions.userId, userIds));

  const subsByUser = new Map<string, typeof subs>();
  for (const sub of subs) {
    const list = subsByUser.get(sub.userId) ?? [];
    list.push(sub);
    subsByUser.set(sub.userId, list);
  }

  let sent = 0;
  let notified = 0;
  const goneEndpoints = new Set<string>();

  for (const reminder of reminders) {
    const userSubs = subsByUser.get(reminder.userId);
    if (!userSubs || userSubs.length === 0) continue;

    const payload: PushPayload = {
      title: "LifeOS reminder",
      body: `${labelFor(reminder.kind)}: ${reminder.title}`,
      url: reminder.url,
      tag: `lifeos-reminder-${reminder.kind}`,
    };

    let deliveredForThis = false;
    for (const sub of userSubs) {
      const result = await sendPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
      );
      if (result.ok) {
        sent += 1;
        deliveredForThis = true;
      } else if (result.gone) {
        goneEndpoints.add(sub.endpoint);
      }
    }
    if (deliveredForThis) notified += 1;
  }

  let pruned = 0;
  if (goneEndpoints.size > 0) {
    await db
      .delete(pushSubscriptions)
      .where(inArray(pushSubscriptions.endpoint, [...goneEndpoints]));
    pruned = goneEndpoints.size;
  }

  return { due: dueCount, sent, notified, pruned, pushConfigured: true };
}

function labelFor(kind: DueReminder["kind"]): string {
  return kind === "task" ? "Task" : kind === "goal" ? "Goal" : "Habit";
}
