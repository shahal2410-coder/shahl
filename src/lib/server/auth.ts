import {
  randomBytes,
  randomUUID,
  createHash,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import {
  db,
  publicUser,
  type User,
  type UserRow,
  type Role,
  audit,
} from "./db";
import { fail, stringField } from "./http";

export const COOKIE = "explorium_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash || hash.length !== 128) return false;
  return timingSafeEqual(
    Buffer.from(hash, "hex"),
    scryptSync(password, salt, 64),
  );
}
export function validateIdentity(data: Record<string, unknown>) {
  const name = stringField(data, "name", true, 100);
  const email = stringField(data, "email", true, 254).toLowerCase();
  const username = stringField(data, "username", true, 40).toLowerCase();
  const password = typeof data.password === "string" ? data.password : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fail(400, "Enter a valid email address.");
  if (!/^[a-z0-9._-]{3,40}$/.test(username))
    fail(
      400,
      "Username must have 3–40 letters, numbers, dots, hyphens, or underscores.",
    );
  if (password.length < 12 || password.length > 128)
    fail(400, "Use a password between 12 and 128 characters.");
  return { name, email, username, password };
}
export function createUser(
  data: Record<string, unknown>,
  role: Role,
  status = "active",
) {
  const { name, email, username, password } = validateIdentity(data);
  const id = randomUUID();
  const profile: Record<string, unknown> = { classIds: [], subjectIds: [] };
  if (role === "student") {
    const year = new Date().getFullYear();
    const count = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role='student'").get() as { count: number };
    profile.admissionId = `EA-${year}-${String(count.count + 1).padStart(5, "0")}`;
  }
  for (const key of ["guardianName", "guardianPhone", "program"])
    if (data[key] !== undefined)
      profile[key] = stringField(data, key, false, 150);
  if (data.age !== undefined) {
    const age = Number(data.age);
    if (!Number.isInteger(age) || age < 3 || age > 100)
      fail(400, "Age must be between 3 and 100.");
    profile.age = age;
  }
  db.prepare(
    "INSERT INTO users (id,name,email,username,password_hash,role,status,profile_json,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
  ).run(
    id,
    name,
    email,
    username,
    hashPassword(password),
    role,
    status,
    JSON.stringify(profile),
    new Date().toISOString(),
  );
  return publicUser(
    db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow,
  );
}
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const hash = createHash("sha256").update(token).digest("hex");
  const row = db
    .prepare(
      "SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id WHERE token_hash = ? AND expires_at > ? AND users.status = 'active'",
    )
    .get(hash, Date.now()) as UserRow | undefined;
  return row ? publicUser(row) : null;
}
export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) fail(401, "Please sign in to continue.");
  return user;
}
export async function createSession(user: User, remember = false) {
  const token = randomBytes(32).toString("hex");
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
  db.prepare(
    "INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)",
  ).run(
    createHash("sha256").update(token).digest("hex"),
    user.id,
    Date.now() + SESSION_SECONDS * 1000,
  );
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: SESSION_SECONDS } : {}),
  });
  audit(user.id, "session.login");
}
export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token)
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(
      createHash("sha256").update(token).digest("hex"),
    );
  jar.delete(COOKIE);
}
const attempts = new Map<string, { count: number; resetAt: number }>();
export function limitAttempts(key: string, limit = 10) {
  const now = Date.now();
  if (attempts.size > 10000)
    for (const [id, item] of attempts)
      if (item.resetAt < now) attempts.delete(id);
  const entry = attempts.get(key);
  if (entry && entry.resetAt > now) {
    if (entry.count >= limit)
      fail(429, "Too many attempts. Please try again in 15 minutes.");
    entry.count += 1;
  } else attempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
}
