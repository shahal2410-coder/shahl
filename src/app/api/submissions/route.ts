import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { body, errorResponse } from "@/lib/server/http";
import { submitAssignment } from "@/lib/server/records";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    return NextResponse.json(
      { data: submitAssignment(user, await body(request)) },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
