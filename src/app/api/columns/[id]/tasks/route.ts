import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const columnTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.columnId, params.id));

  return NextResponse.json(columnTasks);
}
