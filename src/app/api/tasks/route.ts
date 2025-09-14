import { db } from "@/db";
import { tasks } from "@/db/schema";
import { taskCreate } from "@/lib/validation";
import { NextResponse } from "next/server";
import { desc, max, eq } from "drizzle-orm";

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = taskCreate.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Get the highest order number for tasks in this column
  const result = await db
    .select({ maxOrder: max(tasks.order) })
    .from(tasks)
    .where(eq(tasks.columnId, parsed.data.columnId));

  const nextOrder = (result[0]?.maxOrder ?? -1) + 1;

  // Insert the task with the calculated order
  const [row] = await db
    .insert(tasks)
    .values({
      ...parsed.data,
      order: nextOrder,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
