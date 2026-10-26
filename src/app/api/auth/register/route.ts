import { NextResponse } from "next/server";
import { createUser, limitAttempts } from "@/lib/server/auth";
import { audit } from "@/lib/server/db";
import { body, errorResponse, stringField, fail } from "@/lib/server/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const data = await body(request);
    const email = stringField(data, "email", true, 254).toLowerCase();
    limitAttempts(`register:${email}`, 5);
    stringField(data, "guardianName", true, 150);
    const phone = stringField(data, "guardianPhone", true, 30);
    if (!/^[+\d\s()-]{7,30}$/.test(phone))
      fail(400, "Enter a valid guardian phone number.");
    stringField(data, "program", true, 150);
    if (data.age === undefined) fail(400, "Age is required.");
    const user = createUser(data, "student", "pending");
    audit(user.id, "student.register", user.id);
    return NextResponse.json(
      {
        message:
          "Your account has been created and is awaiting academy approval. The academy will contact you using your registration details.",
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
