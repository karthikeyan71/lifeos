import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT 1`);

    return Response.json({
      success: true,
      database: result,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );
  }
}
