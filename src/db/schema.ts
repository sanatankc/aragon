import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const boards = pgTable("boards", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const columns = pgTable("columns", {
  id: uuid("id").primaryKey().defaultRandom(),
  boardId: uuid("board_id")
    .references(() => boards.id)
    .notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  color: varchar("color", { length: 7 }).notNull().default("#49C4E5"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  columnId: uuid("column_id")
    .references(() => columns.id)
    .notNull(),
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
