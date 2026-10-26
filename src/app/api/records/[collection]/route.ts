import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { body, errorResponse } from "@/lib/server/http";
import { mutateRecord, visibleRecords } from "@/lib/server/records";
export const runtime = "nodejs";
type Context = { params: Promise<{ collection: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    const user = await requireUser();
    const { collection } = await context.params;
    return NextResponse.json(
      { data: visibleRecords(user, collection) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
async function mutate(request: Request, context: Context) {
  try {
    const user = await requireUser();
    const { collection } = await context.params;
    const input = await body(request);
    return NextResponse.json(
      { data: mutateRecord(user, collection, request.method, input) },
      { status: request.method === "POST" ? 201 : 200 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
export const POST = mutate;
export const PATCH = mutate;
export const DELETE = mutate;
