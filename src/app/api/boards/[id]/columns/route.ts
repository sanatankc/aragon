import { db } from "@/db";
import { columns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const includeTasks = searchParams.get("include") === "tasks";

  if (includeTasks) {
    const boardColumns = await db.query.columns.findMany({
      where: eq(columns.boardId, params.id),
      with: {
        tasks: true,
      },
    });
    return NextResponse.json(boardColumns);
  }

  const boardColumns = await db
    .select()
    .from(columns)
    .where(eq(columns.boardId, params.id));

  return NextResponse.json(boardColumns);
}
