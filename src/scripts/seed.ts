import { db } from "@/db";
import { boards, columns, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Clearing existing data...");
  
  // Clear existing tasks
  await db.delete(tasks);
  console.log("✓ Cleared tasks");
  
  // Clear existing columns
  await db.delete(columns);
  console.log("✓ Cleared columns");
  
  // Clear existing boards
  await db.delete(boards);
  console.log("✓ Cleared boards");
  
  console.log("Creating fresh data...");
  
  // Create new board
  const [b] = await db.insert(boards).values({ name: "Platform Launch" }).returning();
  console.log("✓ Created board:", b.name);
  
  // Create columns with colors
  const [todo, doing, done] = await db
    .insert(columns)
    .values([
      { boardId: b.id, name: "Todo", color: "#49C4E5", order: 0 },
      { boardId: b.id, name: "Doing", color: "#635FC7", order: 1 },
      { boardId: b.id, name: "Done", color: "#67E2AE", order: 2 },
    ])
    .returning();
  console.log("✓ Created columns with colors");
  
  // Create tasks
  await db.insert(tasks).values([
    { columnId: todo.id, title: "Build UI for onboarding flow", order: 0, description: "" },
    { columnId: todo.id, title: "Build settings UI", order: 1, description: "" },
    { columnId: doing.id, title: "Design settings and search pages", order: 0, description: "" },
    { columnId: done.id, title: "Conduct 5 wireframe tests", order: 0, description: "" },
  ]);
  console.log("✓ Created tasks");
  
  console.log("✅ Database seeded successfully!");
}
main();
