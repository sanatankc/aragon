import { db } from "@/db";
import { columns } from "@/db/schema";
import { columnUpdate } from "@/lib/validation";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const json = await req.json();
  const parsed = columnUpdate.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [updatedColumn] = await db
    .update(columns)
    .set(parsed.data)
    .where(eq(columns.id, params.id))
    .returning();
  if (!updatedColumn) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }
  return NextResponse.json(updatedColumn);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const [deletedColumn] = await db
    .delete(columns)
    .where(eq(columns.id, params.id))
    .returning();
  if (!deletedColumn) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
