import { db } from "@/db";
import { boards, columns } from "@/db/schema";
import { boardCreate } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function GET() {
  const allBoards = await db.select().from(boards);
  return NextResponse.json(allBoards);
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = boardCreate.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Create the board
  const [board] = await db.insert(boards).values(parsed.data).returning();

  // Create default columns
  const defaultColumns = [
    { name: "Todo", color: "#49C4E5", order: 0 },
    { name: "In Progress", color: "#8471F2", order: 1 },
    { name: "Done", color: "#67E2AE", order: 2 },
  ];

  const columnsToInsert = defaultColumns.map(column => ({
    boardId: board.id,
    name: column.name,
    color: column.color,
    order: column.order,
  }));

  await db.insert(columns).values(columnsToInsert);

  return NextResponse.json(board, { status: 201 });
}
