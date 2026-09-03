CREATE TYPE "public"."goal_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."habit_frequency" AS ENUM('daily', 'weekly');--> statement-breakpoint
CREATE TYPE "public"."habit_occurrence_status" AS ENUM('completed', 'missed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('todo', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."task_occurrence_status" AS ENUM('planned', 'completed', 'postponed', 'skipped', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" date,
	"target_date" date,
	"status" "goal_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_occurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"habit_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" "habit_occurrence_status" DEFAULT 'missed' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"frequency" "habit_frequency" DEFAULT 'daily' NOT NULL,
	"start_date" date,
	"end_date" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" date,
	"target_date" date,
	"status" "milestone_status" DEFAULT 'todo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_occurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"planned_date" date NOT NULL,
	"status" "task_occurrence_status" DEFAULT 'planned' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"goal_id" uuid,
	"milestone_id" uuid,
	"category_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"scheduled_date" date,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_occurrences" ADD CONSTRAINT "habit_occurrences_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_occurrences" ADD CONSTRAINT "task_occurrences_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_user_id_idx" ON "categories" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_name_unique" ON "categories" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "goals_user_id_idx" ON "goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goals_user_status_idx" ON "goals" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "goals_target_date_idx" ON "goals" USING btree ("target_date");--> statement-breakpoint
CREATE INDEX "habit_occurrences_habit_id_idx" ON "habit_occurrences" USING btree ("habit_id");--> statement-breakpoint
CREATE INDEX "habit_occurrences_date_idx" ON "habit_occurrences" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "habit_occurrences_habit_date_unique" ON "habit_occurrences" USING btree ("habit_id","date");--> statement-breakpoint
CREATE INDEX "habits_user_id_idx" ON "habits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "habits_user_active_idx" ON "habits" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "habits_category_id_idx" ON "habits" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "milestones_goal_id_idx" ON "milestones" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "milestones_goal_status_idx" ON "milestones" USING btree ("goal_id","status");--> statement-breakpoint
CREATE INDEX "milestones_target_date_idx" ON "milestones" USING btree ("target_date");--> statement-breakpoint
CREATE INDEX "task_occurrences_task_id_idx" ON "task_occurrences" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_occurrences_planned_date_idx" ON "task_occurrences" USING btree ("planned_date");--> statement-breakpoint
CREATE INDEX "task_occurrences_task_date_idx" ON "task_occurrences" USING btree ("task_id","planned_date");--> statement-breakpoint
CREATE INDEX "task_occurrences_status_idx" ON "task_occurrences" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_user_id_idx" ON "tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tasks_user_status_idx" ON "tasks" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "tasks_user_scheduled_date_idx" ON "tasks" USING btree ("user_id","scheduled_date");--> statement-breakpoint
CREATE INDEX "tasks_user_due_date_idx" ON "tasks" USING btree ("user_id","due_date");--> statement-breakpoint
CREATE INDEX "tasks_goal_id_idx" ON "tasks" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "tasks_milestone_id_idx" ON "tasks" USING btree ("milestone_id");--> statement-breakpoint
CREATE INDEX "tasks_category_id_idx" ON "tasks" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");