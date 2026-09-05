import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "completed",
  "cancelled",
]);

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "todo",
  "in_progress",
  "completed",
  "cancelled",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "completed",
  "cancelled",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

export const taskOccurrenceStatusEnum = pgEnum("task_occurrence_status", [
  "planned",
  "completed",
  "postponed",
  "skipped",
  "cancelled",
]);

export const habitFrequencyEnum = pgEnum("habit_frequency", [
  "daily",
  "weekly",
]);

export const habitOccurrenceStatusEnum = pgEnum("habit_occurrence_status", [
  "completed",
  "missed",
  "skipped",
]);

// -----------------------------------------------------------------------------
// Users
// -----------------------------------------------------------------------------

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),

    email: text("email").notNull(),
    name: text("name").default(""),

    // IANA timezone (e.g. "Asia/Kolkata"), captured from the browser on the
    // Settings page. Used to render reminder times and word notifications;
    // null until the user opens Settings.
    timezone: text("timezone"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

// -----------------------------------------------------------------------------
// Push Subscriptions
// -----------------------------------------------------------------------------

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    endpoint: text("endpoint").notNull(),

    p256dh: text("p256dh").notNull(),

    auth: text("auth").notNull(),

    userAgent: text("user_agent"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("push_subscriptions_endpoint_unique").on(table.endpoint),

    index("push_subscriptions_user_id_idx").on(table.userId),
  ],
);

// -----------------------------------------------------------------------------
// Categories
// -----------------------------------------------------------------------------

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    icon: text("icon"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("categories_user_id_idx").on(table.userId),

    uniqueIndex("categories_user_name_unique").on(table.userId, table.name),
  ],
);

// -----------------------------------------------------------------------------
// Goals
// -----------------------------------------------------------------------------

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    title: text("title").notNull(),

    description: text("description"),

    startDate: date("start_date"),

    targetDate: date("target_date"),

    status: goalStatusEnum("status").default("active").notNull(),

    // Optional one-shot reminder. Absolute instant; cleared once sent.
    reminderAt: timestamp("reminder_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("goals_user_id_idx").on(table.userId),

    index("goals_user_status_idx").on(table.userId, table.status),

    index("goals_target_date_idx").on(table.targetDate),

    index("goals_reminder_at_idx").on(table.reminderAt),
  ],
);

// -----------------------------------------------------------------------------
// Milestones
// -----------------------------------------------------------------------------

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, {
        onDelete: "cascade",
      }),

    title: text("title").notNull(),

    description: text("description"),

    startDate: date("start_date"),

    targetDate: date("target_date"),

    status: milestoneStatusEnum("status").default("todo").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("milestones_goal_id_idx").on(table.goalId),

    index("milestones_goal_status_idx").on(table.goalId, table.status),

    index("milestones_target_date_idx").on(table.targetDate),
  ],
);

// -----------------------------------------------------------------------------
// Tasks
// -----------------------------------------------------------------------------

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    goalId: uuid("goal_id").references(() => goals.id, {
      onDelete: "set null",
    }),

    milestoneId: uuid("milestone_id").references(() => milestones.id, {
      onDelete: "set null",
    }),

    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),

    title: text("title").notNull(),

    description: text("description"),

    status: taskStatusEnum("status").default("todo").notNull(),

    priority: taskPriorityEnum("priority").default("medium").notNull(),

    scheduledDate: date("scheduled_date"),

    dueDate: date("due_date"),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }),

    // Optional one-shot reminder. Absolute instant; cleared once sent.
    reminderAt: timestamp("reminder_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("tasks_user_id_idx").on(table.userId),

    index("tasks_user_status_idx").on(table.userId, table.status),

    index("tasks_user_scheduled_date_idx").on(
      table.userId,
      table.scheduledDate,
    ),

    index("tasks_user_due_date_idx").on(table.userId, table.dueDate),

    index("tasks_goal_id_idx").on(table.goalId),

    index("tasks_milestone_id_idx").on(table.milestoneId),

    index("tasks_category_id_idx").on(table.categoryId),

    index("tasks_reminder_at_idx").on(table.reminderAt),
  ],
);

// -----------------------------------------------------------------------------
// Task Occurrences
// -----------------------------------------------------------------------------

export const taskOccurrences = pgTable(
  "task_occurrences",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, {
        onDelete: "cascade",
      }),

    plannedDate: date("planned_date").notNull(),

    status: taskOccurrenceStatusEnum("status").default("planned").notNull(),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("task_occurrences_task_id_idx").on(table.taskId),

    index("task_occurrences_planned_date_idx").on(table.plannedDate),

    index("task_occurrences_task_date_idx").on(table.taskId, table.plannedDate),

    index("task_occurrences_status_idx").on(table.status),
  ],
);

// -----------------------------------------------------------------------------
// Habits
// -----------------------------------------------------------------------------

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),

    name: text("name").notNull(),

    description: text("description"),

    frequency: habitFrequencyEnum("frequency").default("daily").notNull(),

    startDate: date("start_date"),

    endDate: date("end_date"),

    isActive: boolean("is_active").default(true).notNull(),

    // Optional one-shot reminder for the next occurrence. Cleared once sent.
    reminderAt: timestamp("reminder_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("habits_user_id_idx").on(table.userId),

    index("habits_user_active_idx").on(table.userId, table.isActive),

    index("habits_category_id_idx").on(table.categoryId),

    index("habits_reminder_at_idx").on(table.reminderAt),
  ],
);

// -----------------------------------------------------------------------------
// Habit Occurrences
// -----------------------------------------------------------------------------

export const habitOccurrences = pgTable(
  "habit_occurrences",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, {
        onDelete: "cascade",
      }),

    date: date("date").notNull(),

    status: habitOccurrenceStatusEnum("status").default("missed").notNull(),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("habit_occurrences_habit_id_idx").on(table.habitId),

    index("habit_occurrences_date_idx").on(table.date),

    uniqueIndex("habit_occurrences_habit_date_unique").on(
      table.habitId,
      table.date,
    ),
  ],
);
