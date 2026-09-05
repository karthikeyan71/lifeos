# LifeOS — UI Redesign Implementation Specification

## 1. Objective

Apply the provided Figma design to the **existing LifeOS application**.

This is a UI redesign/refactor of an existing working application.

**DO NOT rebuild the application from scratch.**

The existing functionality, database architecture, authentication, Server Actions, queries, validation, and ownership/security logic should remain intact unless a change is strictly required to support the new UI.

The Figma design is the visual source of truth.

The goal is:

> Preserve the existing application behavior and architecture while replacing the current basic UI with the Figma-designed UI.

---

# 2. Product

LifeOS is a personal productivity / life-management application.

The long-term product is intended to help a user:

* Plan their day
* Track tasks
* Manage weekly and monthly goals
* Build habits and consistency
* Avoid forgetting important things
* Understand what they are actually accomplishing
* Identify things they repeatedly postpone or avoid

The current implementation is primarily focused on **authentication and task management**.

Future functionality will include:

* Goals
* Milestones
* Habits
* Weekly planning
* Monthly planning
* Calendar
* Insights

Do not implement future functionality unless it already exists in the codebase.

---

# 3. Technology Stack

The application uses:

* Next.js 16.3.2
* TypeScript
* App Router
* React
* Tailwind CSS
* pnpm
* Supabase Auth
* PostgreSQL
* Drizzle ORM
* Zod
* Vercel as the intended deployment platform

Do not replace the stack.

Do not introduce another framework or UI framework unless explicitly required.

---

# 4. Existing Architecture

The project is intentionally structured by feature.

Current structure is approximately:

```text
lifeos/
├── app/
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── db/
│   ├── index.ts
│   └── schema.ts
│
├── features/
│   └── tasks/
│       ├── actions/
│       │   ├── create-task.ts
│       │   ├── complete-task.ts
│       │   ├── update-task.ts
│       │   └── delete-task.ts
│       │
│       ├── components/
│       │   ├── task-form.tsx
│       │   ├── task-item.tsx
│       │   └── task-edit-form.tsx
│       │
│       ├── queries/
│       │   └── get-tasks.ts
│       │
│       └── schemas/
│           └── task-schema.ts
│
├── lib/
│   └── supabase/
│       ├── client.ts
│       └── server.ts
│
├── drizzle/
│   └── migrations
│
├── AGENTS.md
├── CLAUDE.md
└── package.json
```

Before modifying anything:

1. Inspect the repository.
2. Understand the existing implementation.
3. Identify which components correspond to each Figma screen.
4. Reuse existing components where possible.
5. Do not create duplicate functionality.

The actual repository structure is authoritative if it differs from this document.

---

# 5. Existing Authentication

Authentication is implemented using Supabase Auth.

There are currently:

* Login page
* Signup page
* Server-side authentication checks
* Browser Supabase client
* Server Supabase client

Existing authentication behavior must remain unchanged.

Do not replace Supabase Auth.

Do not move authentication logic into client-side-only logic.

Do not expose secrets.

The authenticated user's identity is obtained through Supabase Auth.

The application's public user record uses the same UUID as the Supabase Auth user.

Architecture:

```text
Supabase Auth
     │
     │ user.id
     ▼
public.users.id
     │
     ▼
tasks.user_id
```

---

# 6. Existing Task Functionality

Tasks currently support:

```text
id
userId
title
description
priority
scheduledDate
dueDate
categoryId
goalId
milestoneId
status
createdAt
updatedAt
```

The exact database schema in `db/schema.ts` is authoritative.

Do not change the database schema simply to make the UI easier.

---

# 7. Task Statuses

These are the ONLY valid task statuses:

```text
todo
in_progress
completed
cancelled
```

There is NO `pending` status.

Do not introduce `pending`.

The UI may display friendly labels such as:

```text
To do
In progress
Completed
Cancelled
```

but the underlying values must remain:

```text
todo
in_progress
completed
cancelled
```

---

# 8. Existing Task Operations

The application already supports:

### Create

User can create a task with:

* Title
* Description
* Priority
* Scheduled date
* Due date
* Category
* Goal
* Milestone

### Read

Tasks are loaded for the authenticated user.

Tasks must only be displayed for the current authenticated user.

### Complete

A task can be marked:

```text
todo → completed
```

### Reopen

A completed task can be reopened:

```text
completed → todo
```

### Update

A task can be edited.

Editable fields include:

* Title
* Description
* Priority
* Scheduled date
* Due date
* Category
* Goal
* Milestone

### Delete

Delete functionality exists/is being implemented.

The UI should provide a natural delete action without changing the underlying security model.

---

# 9. Security / Ownership

This is extremely important.

Never trust a user ID supplied by the browser.

Server Actions must obtain the authenticated user through Supabase Auth.

Task mutations must verify ownership.

For example, updates/deletes should conceptually use:

```sql
WHERE id = task_id
AND user_id = authenticated_user_id
```

Do not remove ownership checks while redesigning the UI.

Do not move database mutations into insecure client-side code.

Do not expose the database directly to the browser.

---

# 10. Existing Database Layer

Database access uses:

```text
Drizzle ORM
        ↓
PostgreSQL
        ↓
Supabase
```

Existing database code should remain intact.

Do not replace Drizzle with Prisma.

Do not replace PostgreSQL with another database.

Do not move database operations into React components.

Keep the existing feature/action/query architecture.

---

# 11. Existing Validation

Task input is validated using Zod.

The current task schema includes validation for:

* title
* description
* priority
* scheduled date
* due date
* category
* goal
* milestone

Do not remove validation just because the Figma form looks different.

If the UI changes the form structure, map the UI values into the existing schema.

The server must remain the final validation boundary.

---

# 12. Figma Design Is the Visual Source of Truth

A Figma design will be provided with this specification.

Use the Figma design to determine:

* Layout
* Spacing
* Typography
* Font sizes
* Font weights
* Colors
* Borders
* Border radius
* Shadows
* Icons
* Button styles
* Input styles
* Card styles
* Navigation
* Responsive behavior
* Empty states
* Modal/sheet behavior
* Hover states
* Active states
* Disabled states
* Loading states

Do not invent a separate visual language.

If the existing implementation conflicts with the Figma design:

**Prefer the Figma design for visual behavior.**

If the Figma design conflicts with existing application functionality:

**Preserve functionality and adapt the UI around it.**

---

# 13. Critical Rule — Do Not Rebuild

Do NOT:

* Create a new Next.js project
* Replace the existing architecture
* Replace the database
* Replace Supabase Auth
* Replace Drizzle
* Replace Zod
* Rewrite working Server Actions unnecessarily
* Duplicate existing task logic
* Create fake/mock task data
* Hardcode tasks from the Figma screenshot
* Remove existing functionality just because it isn't visible in the design

Instead:

```text
Existing application
        +
Figma visual design
        ↓
Refactored existing components
```

---

# 14. Dashboard

The primary application screen is the dashboard.

The dashboard should visually follow the Figma design.

It should provide access to the user's current tasks.

The dashboard should prioritize:

1. Today's tasks
2. Important tasks
3. Task completion
4. Quick task creation

Do not add fake statistics or fake productivity metrics just to fill empty UI space.

If the Figma design contains future-product sections such as:

* Goals
* Habits
* Insights
* Calendar

but those features do not exist yet, treat them as navigation/placeholders rather than pretending the functionality exists.

---

# 15. Task List

The task list should use the existing task data.

Each task should be able to visually communicate:

* Title
* Description where appropriate
* Priority
* Status
* Scheduled date
* Due date
* Completion state

The user should be able to access the existing actions:

```text
Complete
Reopen
Edit
Delete
```

Use the Figma design's interaction pattern.

For example, if the Figma design uses:

```text
...
```

for secondary actions, use that rather than exposing every action as a large button.

---

# 16. Create Task

The existing task creation functionality must remain.

Adapt it to the Figma design.

The UI may be:

* Modal
* Drawer
* Sheet
* Inline form

depending on the Figma design.

Do not create a second create-task implementation.

The UI should call the existing Server Action.

The data flow should remain:

```text
UI
 ↓
Zod validation
 ↓
Server Action
 ↓
Supabase Auth user
 ↓
Drizzle
 ↓
PostgreSQL
```

---

# 17. Edit Task

The existing edit functionality must remain.

Adapt the current edit UI to the Figma design.

Do not create a second update implementation.

The existing `updateTask` Server Action should remain the source of truth for task updates.

---

# 18. Delete Task

Provide the delete interaction according to the Figma design.

If confirmation is required by the design, use a confirmation dialog.

Do not perform deletion optimistically without handling errors.

The existing Server Action should remain responsible for deletion.

---

# 19. Loading States

The UI should feel polished during asynchronous operations.

Existing operations include:

* Creating task
* Updating task
* Completing task
* Reopening task
* Deleting task

Use the Figma design's loading states where available.

Buttons should not allow duplicate submissions.

Examples:

```text
Create
→ Creating...

Save
→ Saving...

Complete
→ Completing...

Delete
→ Deleting...
```

Do not remove existing loading protection.

---

# 20. Error States

Errors should be presented using the visual language of the Figma design.

Examples:

* Invalid task data
* Not authenticated
* Task not found
* Database failure
* Failed mutation

Do not silently swallow errors.

Do not expose sensitive server/database details to the user.

---

# 21. Empty States

Use the Figma empty-state design where provided.

The empty state should not look like an error.

Example concept:

```text
Nothing scheduled for today

Enjoy the breathing room, or add something you want
to accomplish today.

+ Add task
```

Use the exact visual treatment from Figma where available.

---

# 22. Responsive Design

The application must be responsive.

The Figma design may contain desktop and mobile layouts.

Implement both.

Desktop:

```text
Sidebar
     +
Main content
```

Mobile:

```text
Compact header
     +
Main content
     +
Mobile navigation where specified
```

Do not simply shrink the desktop layout.

Use appropriate responsive layouts based on the Figma design.

---

# 23. Component Architecture

Keep components maintainable.

Prefer feature ownership.

For task UI:

```text
features/tasks/
```

should remain the home for task-specific components.

Do not place task-specific logic randomly inside `app/`.

Reusable global UI components can be extracted if there is a real reuse case.

Do not create an enormous generic component abstraction for every small element.

Avoid premature abstraction.

---

# 24. Server vs Client Components

Respect Next.js App Router conventions.

Use Server Components by default.

Use Client Components only when the component requires:

* State
* Event handlers
* Browser APIs
* Client-side interaction

Examples:

Task item with interactive buttons:

```text
Client Component
```

Database query:

```text
Server
```

Server Action:

```text
Server
```

Authentication check:

```text
Server where appropriate
```

Do not add `"use client"` to entire pages unnecessarily.

---

# 25. Styling

Use the existing Tailwind setup.

Prefer Tailwind classes consistent with the existing project.

Do not introduce a large UI framework simply for styling.

Do not replace Tailwind.

If repeated design tokens emerge from Figma, create a small, maintainable design-token approach rather than duplicating arbitrary values everywhere.

---

# 26. Icons

Use the icon system already present in the repository if one exists.

If no icon library exists and icons are required by the Figma design, choose a lightweight, consistent solution.

Do not use random emojis as UI icons.

Icons should match the visual language of the Figma design.

---

# 27. Accessibility

The redesign must preserve good accessibility.

Ensure:

* Buttons are actual buttons
* Links are actual links
* Inputs have labels
* Form controls have accessible names
* Keyboard navigation works
* Focus states are visible
* Color is not the only indication of status
* Modals/dialogs are keyboard accessible
* Touch targets are sufficiently large on mobile

Do not sacrifice accessibility to match a screenshot.

---

# 28. Data Integrity

The UI redesign must not change the meaning of the data.

For example:

```text
Low
Medium
High
```

must map to the existing priority values.

Similarly:

```text
To do
In progress
Completed
Cancelled
```

must map to:

```text
todo
in_progress
completed
cancelled
```

Do not change database values merely because the UI labels are different.

---

# 29. Dates

Respect the existing database date representation.

The UI may display dates in a friendly format:

```text
Today
Tomorrow
Sep 8
```

while maintaining the underlying database representation.

Do not introduce timezone bugs.

Be especially careful with `<input type="date">`.

Inspect the existing schema before changing date handling.

---

# 30. Do Not Add Fake Functionality

The Figma design may visually contain future functionality.

Do not implement fake behavior.

For example, if the design shows:

```text
Goals
Habits
Insights
Calendar
```

but those modules are not implemented yet:

It is acceptable to show them in navigation if appropriate, but do not make them appear functional when they aren't.

Do not fabricate:

* Goal data
* Habit data
* Analytics
* Productivity scores
* Charts
* Calendar events

unless they already exist in the application.

---

# 31. Future Architecture

The UI should be designed so that future modules can fit naturally.

Expected future feature structure:

```text
features/
├── tasks/
├── goals/
├── habits/
├── calendar/
└── insights/
```

Do not build these modules now.

Simply ensure the current UI does not make their future addition difficult.

---

# 32. Visual Quality Bar

The result should feel like a real production product.

Avoid:

* Generic Tailwind-looking pages
* Excessive rounded cards
* Excessive shadows
* Random colors
* Huge headings
* Poor spacing
* Inconsistent buttons
* Inconsistent border radii
* Placeholder text
* Fake data
* Browser-default form controls where Figma specifies custom controls

Pay attention to:

* 4/8px spacing rhythm
* Typography hierarchy
* Alignment
* Consistent component heights
* Consistent icon sizing
* Hover states
* Focus states
* Disabled states
* Loading states
* Empty states
* Mobile behavior

---

# 33. Implementation Process

Follow this process.

## Phase 1 — Understand

Before editing code:

1. Inspect the repository.
2. Inspect the existing task implementation.
3. Inspect authentication.
4. Inspect database schema.
5. Inspect the Figma design.
6. Map Figma screens to existing pages/components.

Do not start rewriting immediately.

---

## Phase 2 — Plan

Create a short internal implementation plan.

For example:

```text
Figma Screen
    ↓
Existing Page
    ↓
Existing Components
    ↓
Required UI Changes
```

Identify:

* Components to modify
* Components to create
* Components that can remain unchanged
* Styling changes
* Responsive changes
* Interaction changes

---

## Phase 3 — Implement

Modify the existing application incrementally.

Priority:

1. Global layout/navigation
2. Dashboard
3. Task list
4. Task item
5. Create task UI
6. Edit task UI
7. Delete UI
8. Login
9. Signup
10. Responsive/mobile refinements

Do not rewrite working backend functionality unless required.

---

## Phase 4 — Verify

After implementation:

Run the existing checks.

At minimum:

```bash
pnpm lint
```

and the project's existing build/type-check commands if available.

Verify:

### Authentication

* Signup works
* Login works
* Logout works
* Unauthenticated users cannot access protected areas

### Tasks

* Create works
* Tasks appear correctly
* Complete works
* Reopen works
* Edit works
* Delete works
* Only the current user's tasks are accessible

### UI

* Desktop matches Figma
* Mobile matches Figma
* No horizontal scrolling
* Loading states work
* Error states work
* Empty states work
* Keyboard interaction works

---

# 34. Important Development Rule

When you encounter a conflict:

### Figma vs current styling

Use Figma.

### Figma vs existing functionality

Preserve functionality and adapt the UI.

### Figma vs security

Security wins.

### Figma vs database integrity

Database integrity wins.

### Existing working architecture vs desire to "clean things up"

Do not refactor unrelated code.

Only change what is necessary.

---

# 35. Final Requirement

At the end of the work, LifeOS should look substantially like the provided Figma design while still being the SAME application.

The user should be able to:

```text
Login
  ↓
Dashboard
  ↓
View tasks
  ↓
Create task
  ↓
Complete task
  ↓
Reopen task
  ↓
Edit task
  ↓
Delete task
```

with all existing authentication, database, validation, ownership, and Server Action behavior preserved.

The implementation should be production-quality, responsive, accessible, and maintainable.

**Do not rebuild. Refactor the existing implementation to match the design.**

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
