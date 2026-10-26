import { NextResponse } from "next/server";
import { records } from "@/lib/server/db";
import { websiteSettings } from "@/lib/server/website";
import { errorResponse } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return NextResponse.json(
      {
        data: {
          settings: websiteSettings(),
          announcements: records("announcements")
            .filter((item) => !item.classId)
            .map(({ id, title, description, createdAt }) => ({
              id,
              title,
              description,
              createdAt,
            })),
          programs: records("subjects").map(
            ({ id, title, description, department }) => ({
              id,
              title,
              description,
              department,
            }),
          ),
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
