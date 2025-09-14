import { db } from "@/db";
import { tasks } from "@/db/schema";
import { taskUpdate } from "@/lib/validation";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const json = await req.json();
  const parsed = taskUpdate.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [updatedTask] = await db
    .update(tasks)
    .set(parsed.data)
    .where(eq(tasks.id, params.id))
    .returning();
  if (!updatedTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(updatedTask);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const [deletedTask] = await db
    .delete(tasks)
    .where(eq(tasks.id, params.id))
    .returning();
  if (!deletedTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
