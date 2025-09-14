import { db } from "@/db";
import { columns } from "@/db/schema";
import { columnCreate } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = columnCreate.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db.insert(columns).values(parsed.data).returning();
  return NextResponse.json(row, { status: 201 });
}
