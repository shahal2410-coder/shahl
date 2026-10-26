import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { errorResponse, fail } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    const user = await requireUser();
    if (user.role !== "admin") fail(403, "Administrator access required.");
    const data = db
      .prepare(
        "SELECT audit_log.id, audit_log.action, audit_log.target_id AS targetId, audit_log.created_at AS createdAt, users.name AS actor FROM audit_log LEFT JOIN users ON audit_log.user_id=users.id ORDER BY audit_log.created_at DESC LIMIT 200",
      )
      .all();
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
