# LifeOS — Engineering Guardrails

These rules apply to every change made to this repository.

Read `AGENTS.md` before making changes. `AGENTS.md` defines the product requirements. This file defines engineering constraints and how the existing application must be modified.

---

## 1. Preserve the existing application

This is an existing application, not a greenfield project.

Before implementing anything:

1. Inspect the relevant existing code.
2. Understand the current data flow.
3. Reuse existing functionality.
4. Make the smallest change necessary.

Do not rebuild working functionality from scratch.

Do not create a parallel implementation when an existing implementation already exists.

---

## 2. Source of truth hierarchy

Use the following hierarchy when sources conflict:

1. Security and data integrity
2. Existing working functionality
3. `AGENTS.md` product requirements
4. Figma/Stitch visual design
5. Implementation preferences

The repository is the source of truth for existing implementation and behavior.

Figma is the source of truth for visual design.

Do not change working behavior merely to make the code resemble the Figma design.

---

## 3. Never invent functionality

Do not implement functionality simply because it appears in a Figma design, mockup, screenshot, or example.

If the design contains future features such as:

* Goals
* Habits
* Calendar
* Insights
* Analytics

but those features are not implemented yet, do not fabricate their backend behavior or data.

Use an appropriate placeholder, disabled state, or navigation treatment if required by the design.

Never create fake production data to make a screen look complete.

---

## 4. Inspect before editing

Never assume the implementation.

Before modifying a feature, inspect:

* Related components
* Server Actions
* Queries
* Database schema
* Validation schemas
* Authentication flow
* Existing types
* Existing dependencies

If a requirement is unclear, inspect the codebase before guessing.

---

## 5. Preserve the architecture

Current architecture:

```text
Next.js App Router
        ↓
Features
        ↓
Server Actions / Queries
        ↓
Drizzle ORM
        ↓
PostgreSQL
```

Authentication:

```text
Supabase Auth
        ↓
Authenticated user
        ↓
Server-side authorization
        ↓
Application data
```

Do not replace this architecture without an explicit requirement.

Do not introduce Prisma, another ORM, another database, or another authentication system.

---

## 6. Authentication is server-authoritative

Never trust identity information supplied by the client.

Never accept a client-provided `userId` as proof of identity.

Always obtain the authenticated user through the existing Supabase server client when authorization is required.

Conceptually:

```ts
const {
  data: { user },
} = await supabase.auth.getUser();
```

The authenticated user's ID is the authoritative identity.

---

## 7. Never weaken ownership checks

Every user-owned resource must be protected server-side.

For tasks, mutations should enforce ownership conceptually as:

```sql
WHERE id = task_id
AND user_id = authenticated_user_id
```

This applies to:

* Update
* Delete
* Complete
* Reopen
* Any future task mutation

Never remove an ownership condition to simplify a UI interaction.

Never authorize a mutation based solely on client-side state.

---

## 8. Keep database operations server-side

Client Components must never directly access PostgreSQL.

Do not expose:

```text
DATABASE_URL
database credentials
server secrets
```

to the browser.

Database access remains behind Server Actions, Server Components, or server-side query functions.

---

## 9. Preserve validation

Zod validation is part of the server-side trust boundary.

Do not remove server-side validation because the UI performs validation.

Client-side validation can improve UX, but server-side validation remains mandatory.

Do not bypass the existing schemas without a legitimate reason.

---

## 10. Do not change the database for UI convenience

Do not modify the database schema simply because the Figma design represents data differently.

Adapt the UI to the existing model.

Only modify:

```text
db/schema.ts
```

when there is an actual product/data requirement.

A visual redesign alone is not a reason to change the database.

---

## 11. Task statuses are fixed

The valid task statuses are:

```text
todo
in_progress
completed
cancelled
```

Never introduce:

```text
pending
```

UI labels may be human-friendly, but application/database values must remain unchanged.

For example:

```text
To do        → todo
In progress  → in_progress
Completed    → completed
Cancelled    → cancelled
```

---

## 12. Reuse existing Server Actions

If an existing Server Action performs the required operation, reuse it.

Current task operations include:

```text
create-task.ts
complete-task.ts
update-task.ts
delete-task.ts
```

Do not create duplicate actions such as:

```text
save-task.ts
remove-task.ts
modify-task.ts
```

unless there is a genuine separate responsibility.

---

## 13. Keep business logic out of UI components

Client Components should primarily handle:

* Interaction
* Local UI state
* Form state
* Loading state
* Error presentation

They should not contain:

* Database queries
* Database mutations
* Authorization logic
* Secrets
* Server-only business rules

Keep business logic in the appropriate server-side layer.

---

## 14. Use Server Components by default

Prefer Server Components.

Add:

```ts
"use client";
```

only when the component genuinely requires:

* React state
* Event handlers
* Browser APIs
* Client-side interaction

Do not turn entire pages into Client Components merely because one child component is interactive.

---

## 15. Do not over-engineer

Prefer the simplest implementation that satisfies the requirement.

Do not introduce abstractions merely because code can theoretically be abstracted.

Avoid creating generic components such as:

```text
UniversalCard
UniversalForm
UniversalModal
UniversalContainer
UniversalManager
```

unless there is a real reuse case.

Good abstraction should reduce complexity, not move it around.

---

## 16. Do not add dependencies unnecessarily

Before installing a package:

1. Check whether the repository already provides the capability.
2. Check whether native Next.js/React/Tailwind functionality is sufficient.
3. Only add a dependency when it provides meaningful value.

Do not introduce a UI library just to reproduce a Figma component.

---

## 17. UI redesign must preserve behavior

When implementing Figma/Stitch designs:

Change:

```text
layout
spacing
typography
colors
visual hierarchy
responsive behavior
interaction presentation
```

without unnecessarily changing:

```text
authentication
database logic
queries
Server Actions
validation
ownership
business rules
```

The objective is:

```text
Existing functionality
        +
Figma visual design
        ↓
Improved LifeOS
```

not:

```text
Figma
   ↓
New application
```

---

## 18. Never hardcode design/mock data into production logic

If Figma contains:

```text
Learn React
Buy groceries
Read a book
```

treat those as design examples unless they already exist in the database.

Render real application data.

Do not hardcode sample tasks to make the UI look populated.

---

## 19. Handle async operations correctly

Mutations must have appropriate:

* Loading states
* Disabled states
* Success handling
* Error handling

Prevent accidental duplicate submissions.

Examples:

```text
Create       → Creating...
Save         → Saving...
Complete     → Completing...
Reopen       → Reopening...
Delete       → Deleting...
```

Do not ignore the result of a Server Action.

---

## 20. Never silently swallow errors

Bad:

```ts
await updateTask(id, data);
```

with no handling of the result.

Prefer:

```ts
const result = await updateTask(id, data);

if (!result.success) {
  // Present the error appropriately.
}
```

User-facing errors should be understandable.

Never expose raw database errors, stack traces, secrets, or internal implementation details.

---

## 21. Preserve accessibility

Do not sacrifice accessibility to match a visual design.

Use:

* Semantic HTML
* Real buttons for actions
* Real links for navigation
* Labels for form fields
* Keyboard-accessible interactions
* Visible focus states
* Appropriate contrast
* Accessible dialogs
* Appropriate disabled states

Do not use clickable `<div>` elements when a button or link is appropriate.

---

## 22. Preserve responsive behavior

Every UI change must consider:

* Desktop
* Tablet
* Mobile

Do not simply make desktop layouts narrower.

If Figma provides a mobile design, implement the mobile behavior intentionally.

Avoid:

* Horizontal scrolling
* Tiny touch targets
* Overflowing modals
* Desktop-only interactions

---

## 23. Keep feature ownership clear

Task-specific code belongs under:

```text
features/tasks/
```

Prefer:

```text
features/tasks/
├── actions/
├── components/
├── queries/
├── schemas/
└── types/
```

when appropriate.

Do not move task business logic into unrelated application files just to make a UI implementation easier.

---

## 24. Don't refactor unrelated code

If asked to redesign the task UI, do not simultaneously refactor:

* Authentication
* Database architecture
* Project configuration
* Unrelated features
* Dependency setup
* File structure

unless the change is directly required.

Keep the change set focused.

---

## 25. Preserve existing data semantics

Do not silently change what existing fields mean.

For example:

```text
priority
status
scheduledDate
dueDate
categoryId
goalId
milestoneId
```

must retain their existing semantics.

UI labels can change.

Underlying data meaning must not.

---

## 26. Be careful with dates and timezones

Inspect the existing database schema before changing date handling.

Do not blindly convert between:

```text
Date
string
UTC
local time
```

to make a TypeScript error disappear.

For date-only fields such as scheduled dates, preserve their date-only semantics.

Avoid introducing timezone shifts through unnecessary `Date` conversions.

---

## 27. Don't use reloads as an excuse for bad state management

`window.location.reload()` may be acceptable as a temporary implementation during development.

However, when improving the UI:

Prefer proper Next.js patterns such as:

* Server Component revalidation
* `router.refresh()`
* Appropriate local state updates

Do not introduce increasingly complex client-side state simply to avoid a refresh.

Use the simplest correct approach.

---

## 28. Don't optimize prematurely

Do not add:

* Complex caching
* Global state
* Optimistic updates
* Background synchronization
* Custom data-fetching frameworks

unless there is an actual requirement.

First make the behavior correct.

Then optimize based on evidence.

---

## 29. Don't modify configuration without reason

Do not casually change:

* `next.config.ts`
* TypeScript configuration
* ESLint configuration
* Tailwind configuration
* Environment variable names
* package manager configuration

A UI task should normally not require infrastructure changes.

If a configuration change is genuinely required, explain why.

---

## 30. Verify changes

After meaningful changes, run the available project checks.

At minimum:

```bash
pnpm lint
```

Also run the project's typecheck/build commands if they exist.

For functional changes, verify the affected user flow.

Do not claim a feature works without verifying it.

---

## 31. Keep changes reviewable

Prefer small, focused changes.

Do not modify dozens of unrelated files when implementing one feature.

Before finishing, inspect the diff and remove:

* Unused imports
* Debug logs
* Temporary code
* Dead code
* Unnecessary dependencies
* Accidental formatting changes
* Experimental code

---

## 32. Do not hide problems

If an implementation has a genuine limitation, don't work around it by silently changing behavior.

Instead:

1. Identify the issue.
2. Determine whether it can be safely fixed.
3. Fix it if within scope.
4. Otherwise leave the existing behavior intact and report the limitation.

Never silently weaken security or data integrity to make a feature appear to work.

---

# Final Rule

When modifying LifeOS:

**Preserve what works. Change only what needs to change.**

The ideal implementation is the smallest clean change that:

* satisfies the product requirement,
* matches the Figma design,
* preserves existing behavior,
* maintains security,
* maintains data integrity,
* follows the existing architecture,
* and passes the project's checks.
