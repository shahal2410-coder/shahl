import { randomBytes, createHash } from "node:crypto";
import { db, type UserRow, audit } from "./db";
import { fail } from "./http";
import { hashPassword } from "./auth";
db.exec(
  `CREATE TABLE IF NOT EXISTS email_tokens (hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), kind TEXT NOT NULL, expires_at INTEGER NOT NULL);`,
);
export function emailAvailable() {
  return !!(
    process.env.RESEND_API_KEY &&
    process.env.EXPLORIUM_EMAIL_FROM &&
    process.env.EXPLORIUM_APP_URL
  );
}
const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function newEmailToken(userId: string, kind: "reset" | "verify") {
  const token = randomBytes(32).toString("hex");
  db.prepare(
    "DELETE FROM email_tokens WHERE expires_at < ? OR (user_id=? AND kind=?)",
  ).run(Date.now(), userId, kind);
  db.prepare(
    "INSERT INTO email_tokens (hash,user_id,kind,expires_at) VALUES (?,?,?,?)",
  ).run(digest(token), userId, kind, Date.now() + 30 * 60 * 1000);
  return token;
}
export async function sendAccountEmail(
  user: UserRow,
  kind: "reset" | "verify",
) {
  if (!emailAvailable())
    fail(
      503,
      "Email services are not configured yet. Please contact the academy for account assistance.",
    );
  const appUrl = new URL(process.env.EXPLORIUM_APP_URL!);
  if (appUrl.protocol !== "https:" && appUrl.hostname !== "localhost")
    fail(503, "A secure academy address is required for account emails.");
  const token = newEmailToken(user.id, kind);
  const link = new URL(`/account?action=${kind}`, appUrl);
  link.hash = `token=${token}`;
  const action =
    kind === "reset" ? "Reset your password" : "Verify your email address";
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EXPLORIUM_EMAIL_FROM,
        to: [user.email],
        subject: `${action} — Explorium Academy`,
        text: `${action}\n\nOpen this link to continue:\n${link.toString()}\n\nThis link expires in 30 minutes and can be used once. If you did not request it, you can ignore this message.\n\nExplorium Academy`,
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    db.prepare("DELETE FROM email_tokens WHERE hash=?").run(digest(token));
    fail(
      503,
      "The email service is temporarily unavailable. Please try again later.",
    );
  }
  if (!response.ok) {
    db.prepare("DELETE FROM email_tokens WHERE hash=?").run(digest(token));
    fail(
      503,
      "The email service could not deliver your message. Please contact the academy.",
    );
  }
  audit(user.id, `email.${kind}.sent`);
}
export function applyEmailToken(
  token: string,
  kind: "reset" | "verify",
  password?: string,
) {
  if (!/^[a-f0-9]{64}$/.test(token))
    fail(
      400,
      "This account link is invalid or expired. Please request a new one.",
    );
  if (
    kind === "reset" &&
    (!password || password.length < 12 || password.length > 128)
  )
    fail(400, "Use a password between 12 and 128 characters.");
  db.exec("BEGIN IMMEDIATE");
  try {
    const row = db
      .prepare(
        "SELECT user_id FROM email_tokens WHERE hash=? AND kind=? AND expires_at>?",
      )
      .get(digest(token), kind, Date.now()) as { user_id: string } | undefined;
    if (!row)
      fail(
        400,
        "This account link is invalid or expired. Please request a new one.",
      );
    const user = db
      .prepare("SELECT * FROM users WHERE id=?")
      .get(row.user_id) as UserRow;
    if (kind === "reset") {
      db.prepare("UPDATE users SET password_hash=? WHERE id=?").run(
        hashPassword(password!),
        user.id,
      );
      db.prepare("DELETE FROM sessions WHERE user_id=?").run(user.id);
    } else {
      const profile = JSON.parse(user.profile_json);
      profile.emailVerifiedAt = new Date().toISOString();
      db.prepare("UPDATE users SET profile_json=? WHERE id=?").run(
        JSON.stringify(profile),
        user.id,
      );
    }
    db.prepare("DELETE FROM email_tokens WHERE user_id=? AND kind=?").run(
      user.id,
      kind,
    );
    audit(user.id, `account.${kind}`);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
