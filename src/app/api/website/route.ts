import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { body, errorResponse, fail } from "@/lib/server/http";
import { websiteSettings, updateWebsite } from "@/lib/server/website";
export const runtime = "nodejs";
export async function GET() {
  try {
    const user = await requireUser();
    if (user.role !== "admin") fail(403, "Administrator access required.");
    return NextResponse.json({ data: websiteSettings() });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function PATCH(request: Request) {
  try {
    return NextResponse.json({
      data: updateWebsite(await requireUser(), await body(request)),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
