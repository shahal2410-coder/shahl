import { NextResponse } from "next/server";
import { limitAttempts } from "@/lib/server/auth";
import { body, errorResponse, fail, stringField } from "@/lib/server/http";
import { db, type UserRow } from "@/lib/server/db";
import {
  emailAvailable,
  sendAccountEmail,
  applyEmailToken,
} from "@/lib/server/email";
export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({ available: emailAvailable() });
}
export async function POST(request: Request) {
  try {
    const data = await body(request);
    const action = stringField(data, "action", true, 30);
    if (action === "reset" || action === "verify") {
      applyEmailToken(
        stringField(data, "token", true, 100),
        action,
        typeof data.password === "string" ? data.password : undefined,
      );
      return NextResponse.json({
        message:
          action === "reset"
            ? "Your password has been updated. You can now sign in."
            : "Your email address is verified. Student accounts still require academy approval.",
      });
    }
    if (!["request-reset", "request-verify"].includes(action))
      fail(400, "Choose a valid account action.");
    if (!emailAvailable())
      fail(
        503,
        "Email services are not configured yet. Please contact the academy for account assistance.",
      );
    const email = stringField(data, "email", true, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      fail(400, "Enter a valid email address.");
    limitAttempts(`email:${email}`, 3);
    const user = db.prepare("SELECT * FROM users WHERE email=?").get(email) as
      | UserRow
      | undefined;
    if (user)
      await sendAccountEmail(
        user,
        action === "request-reset" ? "reset" : "verify",
      );
    return NextResponse.json({
      message:
        "If an account matches this email, a link will arrive shortly. Check your inbox and spam folder.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
