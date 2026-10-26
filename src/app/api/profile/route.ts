import { NextResponse } from "next/server";
import { requireUser, hashPassword, verifyPassword } from "@/lib/server/auth";
import { db, publicUser, userById, audit } from "@/lib/server/db";
import { body, errorResponse, fail, stringField } from "@/lib/server/http";
export const runtime = "nodejs";
export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const data = await body(request);
    for (const key of Object.keys(data))
      if (
        ![
          "name",
          "guardianName",
          "guardianPhone",
          "currentPassword",
          "newPassword",
        ].includes(key)
      )
        fail(400, "That profile field cannot be changed here.");
    const row = userById(user.id)!;
    const profile = JSON.parse(row.profile_json);
    for (const key of ["guardianName", "guardianPhone"])
      if (data[key] !== undefined)
        profile[key] = stringField(data, key, false, 150);
    const name =
      data.name !== undefined ? stringField(data, "name", true, 100) : row.name;
    let passwordHash = row.password_hash;
    if (data.newPassword !== undefined) {
      const password =
        typeof data.newPassword === "string" ? data.newPassword : "";
      if (
        !verifyPassword(
          typeof data.currentPassword === "string" ? data.currentPassword : "",
          row.password_hash,
        )
      )
        fail(403, "Your current password is incorrect.");
      if (password.length < 12 || password.length > 128)
        fail(400, "Use a password between 12 and 128 characters.");
      passwordHash = hashPassword(password);
      db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user.id);
    }
    db.prepare(
      "UPDATE users SET name=?,profile_json=?,password_hash=? WHERE id=?",
    ).run(name, JSON.stringify(profile), passwordHash, user.id);
    audit(user.id, "profile.update", user.id);
    return NextResponse.json({ user: publicUser(userById(user.id)!) });
  } catch (error) {
    return errorResponse(error);
  }
}
