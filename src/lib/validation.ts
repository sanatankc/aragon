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
});
export const taskUpdate = z.object({
  title: z.string().min(2).max(160).optional(),
  description: z.string().max(5000).optional(),
  columnId: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

