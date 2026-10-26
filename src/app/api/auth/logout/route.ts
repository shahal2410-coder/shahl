import { NextResponse } from "next/server";
import { endSession } from "@/lib/server/auth";
import { errorResponse, assertSameOrigin } from "@/lib/server/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await endSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
