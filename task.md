Problem Statement:

# [Aragon.ai](http://Aragon.ai) Full Stack Project

Hello! Thanks for participating in Aragon.ai’s technical interview today! 

Your challenge will be to build a basic task management app. There is a time limit with this challenge, so it’s essential to prioritize the most important features. For example it’s better to implement 7/10 requirements well, than it is to do 10/10 requirements poorly. It’s also highly recommended that during the challenge you use AI tools such as chatgpt, claude, deepseek to help accelerate your progress.

If you are a more frontend-leaning engineer you should aim to complete 100% of the frontend portion (good design system component, organization, etc.). Or vice versa if you are a backend focused engineer. Spend more time on the routes, db design, controller logic, etc. However it is expected that you achieve core functionality on both frontend backend portions of this challenge.

![Screenshot 2024-04-19 at 9.25.58 AM.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/5b916772-e2b9-48e6-b858-6c55bb539cd9/c48e2e1c-6e43-4321-8369-641613dbdd47/Screenshot_2024-04-19_at_9.25.58_AM.png)

## Requirements

Your users should be able to:

Frontend

- Create, read, update, and delete boards and tasks
- There should be frontend form validations when trying to create/edit boards and tasks
- Use state management on frontend (i.e. react hooks)
- Hover states for all interactive elements on the page
- Use the optimal responsive layout for the app depending on their device's screen size
- You should not use any external component library. Everything should be using react components.
- Visually it should be high fidelity and look similar to the sample screenshot shared above

Backend

- Develop a API using Node.js and Express or graphql (or Next.js API routes)
- Use PostgreSQL as the database and follow good system design principles
- Ensure API endpoints follow proper conventions (e.g., CRUD operations for boards and tasks)
- Implement validation and error handling for API requests
- Use an ORM (i.e knex.js, prisma, objection, etc.) for database interactions
- Optimize database queries for performance and scalability
- Implement logging and monitoring for debugging and analytics

## Not Required

Following features are not required. But if you have time can implement as a bonus

- Allow users to drag and drop tasks to change their status and re-order them in a column
- Being able to add status columns
- Light/Dark Mode
- User authentication
- Don’t worry about tasks vs subtasks.

### Submission Instructions

Take up to 2.5 hr to work on the challenge

Take up to 30 minutes for the submission

Total max time is 3 hours

Send the final solution to akhil@aragon.ai

When you send the solution. Include the source code either via google drive or github link.

Include a [loom](https://www.loom.com/) or screen recording with your submission where you explain the functionality that you’ve built. You should also walk through the feature visually and show the UI in addition to discussing the code and technical decisions/tradeoffs. Communication here will be important.

---

Solution:

Below is a detailed, step-by-step execution plan that multiple AI/agents can follow to build the task management app using Next.js + Drizzle + PostgreSQL, with custom columns and drag-and-drop (no UI component library). It includes data models, API contracts, validations, UI structure, DnD algorithm, logging, testing, and delivery checklist.

Project goals
- Core: CRUD for Boards, Columns, and Tasks with client/server validation, responsive Kanban UI, and polished interactions.
- Tech: Next.js (App Router, TypeScript), Drizzle ORM + drizzle-kit migrations, PostgreSQL, Zod for validation, no external UI component library, custom DnD via Pointer Events, logging with pino or simple console wrapper.

Top-level file/folder structure
- app/
  - layout.tsx
  - page.tsx
  - boards/[id]/page.tsx
  - api/
    - boards/route.ts
    - boards/[id]/route.ts
    - boards/[id]/columns/route.ts
    - columns/route.ts
    - columns/[id]/route.ts
    - columns/[id]/tasks/route.ts
    - tasks/route.ts
    - tasks/[id]/route.ts
    - boards/[id]/reorder-columns/route.ts
    - boards/[id]/reorder-tasks/route.ts
- components/
  - Sidebar.tsx
  - KanbanBoard.tsx
  - Column.tsx
  - TaskCard.tsx
  - modals/BoardForm.tsx
  - modals/ColumnForm.tsx
  - modals/TaskForm.tsx
  - modals/Confirm.tsx
  - ui/Button.tsx
  - ui/Input.tsx
  - ui/Textarea.tsx
  - ui/Modal.tsx
  - ui/Toast.tsx
- lib/
  - validation.ts
  - fetch.ts
  - logger.ts
  - dnd.ts
- db/
  - schema.ts
  - index.ts
- drizzle.config.ts
- prisma-like seed: scripts/seed.ts
- docker-compose.yml
- README.md

Shared environment and setup
- .env
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aragon
NODE_ENV=development
```
- docker-compose.yml
```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: aragon
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 3s
      timeout: 3s
      retries: 10
```
- package.json scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "seed": "tsx scripts/seed.ts"
  }
}
```

Drizzle setup
- drizzle.config.ts
```ts
import type { Config } from "drizzle-kit";
export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```
- db/index.ts
```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```
- db/schema.ts
```ts
import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const boards = pgTable("boards", {
  id: varchar("id", { length: 36 }).primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const columns = pgTable("columns", {
  id: varchar("id", { length: 36 }).primaryKey().defaultRandom(),
  boardId: varchar("board_id", { length: 36 })
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 36 }).primaryKey().defaultRandom(),
  columnId: varchar("column_id", { length: 36 })
    .notNull()
    .references(() => columns.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull().default(""),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const boardsRelations = relations(boards, ({ many }) => ({
  columns: many(columns),
}));

export const columnsRelations = relations(columns, ({ one, many }) => ({
  board: one(boards, { fields: [columns.boardId], references: [boards.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  column: one(columns, { fields: [tasks.columnId], references: [columns.id] }),
}));
```

Shared validation (Zod)
```ts
// lib/validation.ts
import { z } from "zod";

export const boardCreate = z.object({ name: z.string().min(2).max(120) });
export const boardUpdate = boardCreate.partial();

export const columnCreate = z.object({
  boardId: z.string(),
  name: z.string().min(1).max(120),
  order: z.number().int().min(0).optional(),
});
export const columnUpdate = z.object({
  name: z.string().min(1).max(120).optional(),
  order: z.number().int().min(0).optional(),
});

export const taskCreate = z.object({
  columnId: z.string(),
  title: z.string().min(2).max(160),
  description: z.string().max(5000).optional().default(""),
  order: z.number().int().min(0).optional(),
});
export const taskUpdate = z.object({
  title: z.string().min(2).max(160).optional(),
  description: z.string().max(5000).optional(),
  columnId: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderColumns = z.object({
  moves: z.array(z.object({ id: z.string(), order: z.number().int().min(0) })).min(1),
});

export const reorderTasks = z.object({
  moves: z.array(
    z.object({
      taskId: z.string(),
      toColumnId: z.string(),
      toOrder: z.number().int().min(0),
    })
  ).min(1),
});
```

API contracts (Next.js App Router, JSON)
- Boards
  - GET /api/boards
    - Response 200: [{ id, name, createdAt, updatedAt }]
  - POST /api/boards
    - Body: { name }
    - Responses: 201 { board }, 400 validation error
  - GET /api/boards/:id
    - Response 200: { id, name }
  - PATCH /api/boards/:id
    - Body: { name? }
    - Responses: 200 { board }, 404
  - DELETE /api/boards/:id
    - Response: 204
- Columns
  - GET /api/boards/:id/columns
    - Query include=tasks true|false
    - Response 200: [{ id, boardId, name, order, tasks? }]
  - POST /api/columns
    - Body: { boardId, name, order? }
    - Response 201 { column }
  - PATCH /api/columns/:id
    - Body: { name?, order? }
    - Response 200 { column }
  - DELETE /api/columns/:id
    - 204
  - PATCH /api/boards/:id/reorder-columns
    - Body: { moves: [{ id, order }] }
    - 200 { ok: true }
- Tasks
  - GET /api/columns/:id/tasks
    - 200: [{ id, columnId, title, description, order }]
  - POST /api/tasks
    - Body: { columnId, title, description?, order? }
    - 201 { task }
  - PATCH /api/tasks/:id
    - Body: { title?, description?, columnId?, order? }
    - 200 { task }
  - DELETE /api/tasks/:id
    - 204
  - PATCH /api/boards/:id/reorder-tasks
    - Body: { moves: [{ taskId, toColumnId, toOrder }] }
    - 200 { ok: true }

API implementation patterns
- Use db.transaction for any reorder or multi-row changes.
- Always validate request body with Zod; return 400 with flattened errors.
- Return correct status codes: 201 create, 204 delete, 404 not found, 500 on unknown errors.
- Example handler (create task)
```ts
// app/api/tasks/route.ts
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { taskCreate } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = taskCreate.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db.insert(tasks).values(parsed.data).returning();
  return NextResponse.json(row, { status: 201 });
}
```
- Example reorder (tasks)
```ts
// app/api/boards/[id]/reorder-tasks/route.ts
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { reorderTasks } from "@/lib/validation";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = reorderTasks.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { moves } = parsed.data;

  await db.transaction(async (tx) => {
    // Stage 1: move tasks to target column with high temporary order
    for (const m of moves) {
      await tx
        .update(tasks)
        .set({ columnId: m.toColumnId, order: 1_000_000 + m.toOrder })
        .where(eq(tasks.id, m.taskId));
    }
    // Stage 2: for each affected column, re-sequence orders 0..n-1
    const affected = Array.from(new Set(moves.map((m) => m.toColumnId)));
    for (const colId of affected) {
      const rows = await tx.query.tasks.findMany({
        where: (t, { eq }) => eq(t.columnId, colId),
        orderBy: (t, { asc }) => [asc(t.order), asc(t.createdAt)],
      });
      for (let i = 0; i < rows.length; i++) {
        await tx.update(tasks).set({ order: i }).where(eq(tasks.id, rows[i].id));
      }
    }
  });

  return NextResponse.json({ ok: true });
}
```

Frontend architecture and responsibilities
- State: React hooks + SWR (or useEffect + fetch) for data fetching and optimistic updates. No UI component libs.
- Layout
  - Sidebar with boards list and create button.
  - Main Kanban area. Columns are horizontally scrollable on small screens; grid of columns on md+.
- Forms
  - Controlled inputs, Zod client-side validation (same schemas), error messages inline.
- Styling
  - Tailwind CSS utilities allowed (not a component library).
  - Hover states: rings, bg changes, subtle transforms.
  - Focus styles for accessibility.
- Empty/loading/error states for each list.

Client fetch utilities
```ts
// lib/fetch.ts
export async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}
```

Drag-and-drop plan

Why dnd-kit


- Headless: No UI components; you still build your own React components (complies with “no external component library” rule).

- Great for sortable lists and multi-container boards.

- Keyboard-accessible out of the box.

Packages to add


- dnd-kit/core

- dnd-kit/sortable

- dnd-kit/modifiers

Data assumptions


- Columns: { id, name, order }

- Tasks: { id, columnId, title, order }

- Local state keeps columns and tasks sorted by order.

Top-level architecture


- KanbanBoard wraps DndContext and manages sensors and collision detection.

- Each Column is a SortableContext with items=[taskIds] strategy={verticalListSortingStrategy}.

- Each TaskCard uses useSortable to become draggable/sortable.

- For cross-column moves, we update columnId and index on drop.

- Optimistic UI then PATCH /api/boards/:id/reorder-tasks with a single move or a batch when needed.

Implementation plan


1. Sensors and DndContext


- Create sensors for mouse, touch, and keyboard.

- Use closestCenter collision detection.

- Constrain dragging to the board area with modifiers if desired.

Code snippet


	// components/KanbanBoard.tsx
	import {
	  DndContext,
	  DragOverlay,
	  PointerSensor,
	  TouchSensor,
	  KeyboardSensor,
	  closestCenter,
	  useSensor,
	  useSensors,
	} from "@dnd-kit/core";
	import {
	  SortableContext,
	  verticalListSortingStrategy,
	} from "@dnd-kit/sortable";
	import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
	import { useState } from "react";
	import Column from "./Column";
	import TaskCard from "./TaskCard";
	
	export default function KanbanBoard({ columns }: { columns: ColumnWithTasks[] }) {
	  const sensors = useSensors(
	    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
	    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
	    useSensor(KeyboardSensor)
	  );
	
	  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
	  const activeTask = columns.flatMap(c => c.tasks).find(t => t.id === activeTaskId) ?? null;
	
	  function handleDragStart(event: any) {
	    const { active } = event;
	    setActiveTaskId(active.id);
	  }
	
	  function handleDragOver(event: any) {
	    // Optional: live move placeholder across columns for visual accuracy
	    // You can compute target column by event.over?.id and update optimistic placeholder
	  }
	
	  async function handleDragEnd(event: any) {
	    const { active, over } = event;
	    setActiveTaskId(null);
	    if (!over) return;
	
	    const source = findTaskLocation(columns, active.id);
	    const target = findDropLocation(columns, over);
	
	    if (!source || !target) return;
	
	    // If nothing changed, bail
	    if (source.columnId === target.columnId && source.index === target.index) return;
	
	    // Optimistic update: mutate local state to reflect the move
	    const snapshot = structuredClone(columns);
	    applyMove(columns, active.id, source, target);
	    // Persist
	    try {
	      await fetch(`/api/boards/${target.boardId}/reorder-tasks`, {
	        method: "PATCH",
	        headers: { "Content-Type": "application/json" },
	        body: JSON.stringify({
	          moves: [{
	            taskId: active.id,
	            toColumnId: target.columnId,
	            toOrder: target.index,
	          }],
	        }),
	      });
	    } catch {
	      // Revert on failure
	      restoreColumnsFromSnapshot(columns, snapshot);
	    }
	  }
	
	  return (
	    <DndContext
	      sensors={sensors}
	      collisionDetection={closestCenter}
	      onDragStart={handleDragStart}
	      onDragOver={handleDragOver}
	      onDragEnd={handleDragEnd}
	      modifiers={[restrictToParentElement]}
	    >
	      <div className="grid auto-cols-[280px] grid-flow-col gap-4 overflow-x-auto p-4">
	        {columns
	          .sort((a, b) => a.order - b.order)
	          .map((col) => (
	            <SortableContext
	              key={col.id}
	              items={col.tasks.map((t) => t.id)}
	              strategy={verticalListSortingStrategy}
	            >
	              <Column column={col} />
	            </SortableContext>
	          ))}
	      </div>
	
	      <DragOverlay>
	        {activeTask ? (
	          <TaskCard task={activeTask} dragging />
	        ) : null}
	      </DragOverlay>
	    </DndContext>
	  );
	}


1. Sortable TaskCard


- useSortable supplies transforms, transition, attributes, listeners.

- Apply style transform to the card.


	// components/TaskCard.tsx
	import { useSortable } from "@dnd-kit/sortable";
	import { CSS } from "@dnd-kit/utilities";
	
	export default function TaskCard({ task, dragging = false }: { task: Task; dragging?: boolean }) {
	  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
	    useSortable({ id: task.id });
	
	  const style = {
	    transform: CSS.Translate.toString(transform),
	    transition,
	    opacity: isDragging || dragging ? 0.9 : 1,
	    boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.3)" : undefined,
	  };
	
	  return (
	    <div
	      ref={setNodeRef}
	      style={style}
	      {...attributes}
	      {...listeners}
	      className="rounded-md bg-slate-800 p-3 text-slate-100 hover:ring-1 hover:ring-slate-600 cursor-grab active:cursor-grabbing"
	    >
	      <div className="font-medium">{task.title}</div>
	      {!!task.description && (
	        <div className="mt-1 text-sm text-slate-400 line-clamp-2">{task.description}</div>
	      )}
	    </div>
	  );
	}


1. Column component


- Renders header and list of TaskCard.

- The SortableContext is provided by parent; just render items in current order.


	// components/Column.tsx
	export default function Column({ column }: { column: ColumnWithTasks }) {
	  return (
	    <div className="w-[280px] shrink-0">
	      <div className="mb-3 flex items-center justify-between">
	        <h3 className="text-sm uppercase tracking-wide text-slate-400">
	          {column.name} ({column.tasks.length})
	        </h3>
	        {/* Add task button, menu etc. */}
	      </div>
	      <div className="flex flex-col gap-2">
	        {column.tasks
	          .sort((a, b) => a.order - b.order)
	          .map((t) => (
	            <TaskCard key={t.id} task={t} />
	          ))}
	      </div>
	    </div>
	  );
	}


1. Cross-container identification


- dnd-kit’s over.id refers to the droppable container or item you’re hovering over.

- Common approach:
	- Give each Column a droppable container id like column:{columnId}.

	- Each Task has id task:{taskId}.

	- On dragOver/dragEnd, parse over.id to know if it’s a task or a column, then compute drop column and index.


Helpers


	// lib/dnd.ts
	type Columns = ColumnWithTasks[];
	
	export function findTaskLocation(columns: Columns, taskId: string) {
	  for (const c of columns) {
	    const idx = c.tasks.findIndex((t) => t.id === taskId);
	    if (idx !== -1) return { boardId: c.boardId, columnId: c.id, index: idx };
	  }
	  return null;
	}
	
	export function findDropLocation(columns: Columns, over: any) {
	  // over.id might be a task id or a column id depending on where we are hovering
	  const overId = String(over.id);
	  const col = columns.find((c) => c.id === overId);
	  if (col) {
	    // Dropped on empty area of a column: append to end
	    return { boardId: col.boardId, columnId: col.id, index: col.tasks.length };
	  }
	  // Otherwise over a task; drop before that task
	  const loc = findTaskLocation(columns, overId);
	  if (loc) return { boardId: loc.boardId, columnId: loc.columnId, index: loc.index };
	  return null;
	}
	
	export function applyMove(columns: Columns, taskId: string, source: any, target: any) {
	  const from = columns.find((c) => c.id === source.columnId)!;
	  const to = columns.find((c) => c.id === target.columnId)!;
	
	  const [task] = from.tasks.splice(source.index, 1);
	  task.columnId = to.id;
	
	  let insertIndex = target.index;
	  if (from.id === to.id && source.index < target.index) insertIndex -= 1;
	
	  to.tasks.splice(insertIndex, 0, task);
	
	  // Re-sequence order values
	  from.tasks.forEach((t, i) => (t.order = i));
	  if (from !== to) to.tasks.forEach((t, i) => (t.order = i));
	}
	
	export function restoreColumnsFromSnapshot(target: Columns, snapshot: Columns) {
	  // simple deep replace
	  for (let i = 0; i < target.length; i++) target[i] = snapshot[i];
	}


1. Making columns droppable


- Wrap each column’s container with a Droppable area by setting id to column.id using useDroppable or simply relying on SortableContext behavior. For explicit empty-area drops, use useDroppable.


	import { useDroppable } from "@dnd-kit/core";
	function DroppableColumnWrapper({ id, children }: { id: string; children: React.ReactNode }) {
	  const { setNodeRef, isOver } = useDroppable({ id });
	  return (
	    <div ref={setNodeRef} className={isOver ? "ring-2 ring-indigo-500 rounded-md p-1" : ""}>
	      {children}
	    </div>
	  );
	}


1. Column reordering (optional stretch)


- Make columns themselves sortable horizontally using SortableContext with horizontalListSortingStrategy and a ColumnHeader that uses useSortable.

- On dragEnd for column sort, send PATCH /api/boards/:id/reorder-columns with new order.


1. Optimistic updates and server sync


- On dragEnd, immediately update local state with applyMove, then call reorder endpoint.

- If server fails, revert to snapshot.


1. Accessibility and UX


- KeyboardSensor enables keyboard DnD: Space to pick, arrows to move, Space/Enter to drop.

- DragOverlay shows a lifted copy of the task; style with shadow and scale for clarity.

- Visual hints: highlight target column via isOver, show placeholder spacing naturally via sorting strategy.


1. Performance tips


- Memoize Column and TaskCard with React.memo.

- Use CSS will-change: transform on TaskCard for smoother dragging.

- Keep state updates scoped: store board data in a single source and pass slices to columns.


1. Server API usage


- For single-task moves: send one move object.

- For multi-select or complex reorder, batch multiple moves in the same request. The server will re-sequence per column in a transaction as designed earlier.
UI components
- Sidebar.tsx
  - Lists boards, indicates active, button to add board.
  - Collapsible on small screens; overlay drawer trigger.
- KanbanBoard.tsx
  - Accepts { board, columns } and manages drag state.
  - Renders Column for each.
- Column.tsx
  - Props: { column, onCreateTask, onEditColumn, onDeleteColumn }
  - Renders TaskCard list; exposes ref for DnD measurement.
- TaskCard.tsx
  - Props: { task, onEdit, onDelete }
  - Pointer handlers for DnD; aria-grabbed attributes when dragging.
- Modals: BoardForm, ColumnForm, TaskForm, Confirm
  - Controlled props open/onClose/onSubmit; uses Zod validation.

Frontend example: optimistic create task
```ts
async function createTask(input: { columnId: string; title: string; description?: string; }) {
  const colIdx = columns.findIndex((c) => c.id === input.columnId);
  const snapshot = structuredClone(columns);
  const newTask = {
    id: "tmp-" + Math.random().toString(36).slice(2),
    columnId: input.columnId,
    title: input.title,
    description: input.description ?? "",
    order: columns[colIdx].tasks.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setColumns((draft) => {
    draft[colIdx].tasks.push(newTask as any);
  });
  try {
    const saved = await api("/api/tasks", { method: "POST", body: JSON.stringify(input) });
    setColumns((draft) => {
      const i = draft[colIdx].tasks.findIndex((t) => t.id === newTask.id);
      if (i !== -1) draft[colIdx].tasks[i] = saved;
    });
    toast("Task created");
  } catch (e) {
    setColumns(snapshot);
    toast("Failed to create task");
  }
}
```

Logging and monitoring
- lib/logger.ts
```ts
export const log = {
  info: (...a: any[]) => console.log("[INFO]", ...a),
  error: (...a: any[]) => console.error("[ERROR]", ...a),
};
```
- In each API handler, log method, path, duration, and errors. Consider adding a simple middleware wrapper.

Testing and QA checklist
- API
  - Create board → create three columns → create tasks → list/get → update → delete.
  - Reorder columns with gaps and duplicates; ensure dense 0..n-1 after operation.
  - Reorder tasks across columns; ensure dense ordering in both source and target.
  - Input validation returns 400 with details.
  - Deleting a board cascades columns and tasks.
- Frontend
  - Form validation messages appear and block submit until valid.
  - Hover states on buttons/cards/column headers.
  - Responsive layout: mobile (column horizontal scroll), tablet, desktop (3+ columns grid).
  - DnD smoothness, placeholder positioning correctness, optimistic update, error rollback.
  - Keyboard focus and Escape closes modals.
- Performance
  - Ensure lists are keyed by id, memoize heavy components, avoid layout thrash by caching rects during drag.

Timeboxed execution plan (2.5 hours build)
- 0:00–0:15
  - Initialize Next.js + TS + Tailwind.
  - Bring up Postgres via Docker; configure Drizzle; write schema; run migrations; seed 1 board with 3 columns and sample tasks.
- 0:15–0:45
  - Implement Boards/Columns/Tasks CRUD API routes with Zod validation and logging.
  - Implement reorder endpoints with transactions.
- 0:45–1:35
  - Build layout, Sidebar, KanbanBoard, Column, TaskCard.
  - Fetch data and render; sorting by order; empty/loading states.
  - Implement create/edit/delete modals for board/column/task with client validation.
- 1:35–2:10
  - Implement custom DnD: pointer handlers, ghost, placeholder, optimistic reorder, server PATCH call.
  - Add inline feedback (toasts).
- 2:10–2:30
  - QA full CRUD + DnD; fix bugs; polish styles and responsiveness.
  - Prepare README and seed instructions.

Seed script
```ts
// scripts/seed.ts
import { db } from "@/db";
import { boards, columns, tasks } from "@/db/schema";

async function main() {
  const [b] = await db.insert(boards).values({ name: "Platform Launch" }).returning();
  const [todo, doing, done] = await db
    .insert(columns)
    .values([
      { boardId: b.id, name: "Todo", order: 0 },
      { boardId: b.id, name: "Doing", order: 1 },
      { boardId: b.id, name: "Done", order: 2 },
    ])
    .returning();
  await db.insert(tasks).values([
    { columnId: todo.id, title: "Build UI for onboarding flow", order: 0, description: "" },
    { columnId: todo.id, title: "Build settings UI", order: 1, description: "" },
    { columnId: doing.id, title: "Design settings and search pages", order: 0, description: "" },
    { columnId: done.id, title: "Conduct 5 wireframe tests", order: 0, description: "" },
  ]);
  console.log("Seeded");
}
main();
```

Acceptance criteria
- Users can create/read/update/delete boards, columns, tasks.
- Client-side and server-side validation enforce required fields and length bounds.
- UI visually resembles provided screenshot: dark theme, sidebar, three or more columns with cards and subtasks note omitted.
- All interactive elements have hover states.
- Responsive across mobile/desktop.
- Drag-and-drop allows moving tasks within and across columns; order persists.
- API endpoints adhere to the contracts above and return appropriate status codes.
- Logging present; errors show structured responses.

Submission checklist
- GitHub repo or Drive zip with source.
- README with:
  - Setup steps (Docker, env, migrations, seed).
  - Architecture overview and decisions/tradeoffs.
  - API list with examples.
  - Demo CRUD and DnD.
  - Walk through schema, reorder algorithm, validation, and API.
  - Discuss scalability: indexes on (columnId, order), transaction usage, batching, and potential future auth/multi-user.
