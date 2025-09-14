import { db } from "@/db";
import { boards } from "@/db/schema";
import { boardUpdate } from "@/lib/validation";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const [board] = await db.select().from(boards).where(eq(boards.id, params.id));
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  return NextResponse.json(board);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const json = await req.json();
  const parsed = boardUpdate.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [updatedBoard] = await db
    .update(boards)
    .set(parsed.data)
    .where(eq(boards.id, params.id))
    .returning();
  if (!updatedBoard) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  return NextResponse.json(updatedBoard);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const [deletedBoard] = await db
    .delete(boards)
    .where(eq(boards.id, params.id))
    .returning();
  if (!deletedBoard) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
