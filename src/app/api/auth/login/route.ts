import { NextResponse } from "next/server";
import { db, publicUser, type UserRow } from "@/lib/server/db";
import {
  createSession,
  verifyPassword,
  limitAttempts,
} from "@/lib/server/auth";
import { body, errorResponse, fail, stringField } from "@/lib/server/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const data = await body(request);
    const identifier = stringField(data, "identifier", true, 254).toLowerCase();
    const password = typeof data.password === "string" ? data.password : "";
    const role = stringField(data, "role", true, 20);
    if (!["admin", "teacher", "student"].includes(role))
      fail(400, "Choose a valid account role.");
    if (password.length > 128) fail(400, "Invalid credentials.");
    limitAttempts(`login:${identifier}`);
    const row = db
      .prepare(
        "SELECT * FROM users WHERE (email = ? OR username = ?) AND role = ?",
      )
      .get(identifier, identifier, role) as UserRow | undefined;
    if (!row || !verifyPassword(password, row.password_hash))
      fail(401, "The sign-in details do not match an account in this space.");
    if (row.status === "pending")
      fail(
        403,
        "Your account is awaiting academy approval. Please contact the academy.",
      );
    if (row.status !== "active")
      fail(403, "This account is inactive. Please contact the academy.");
    if (
      process.env.EXPLORIUM_REQUIRE_VERIFIED_EMAIL === "true" &&
      !JSON.parse(row.profile_json).emailVerifiedAt
    )
      fail(
        403,
        "Please verify your email address before signing in. Request a verification link from account assistance.",
      );
    const user = publicUser(row);
    await createSession(user, data.remember === true);
    return NextResponse.json({ user });
  } catch (error) {
    return errorResponse(error);
  }
}
