import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";

// Run locally using deployment-managed variables. Credentials are never logged.
const role = process.env.EXPLORIUM_ACCOUNT_ROLE || "admin";
const email =
  process.env.EXPLORIUM_ACCOUNT_EMAIL ||
  (role === "teacher"
    ? "exploriumteachers@gmail.com"
    : "exploriumadmin@gmail.com");
const username =
  process.env.EXPLORIUM_ACCOUNT_USERNAME ||
  (role === "teacher" ? "teacher" : "administrator");
const name =
  process.env.EXPLORIUM_ACCOUNT_NAME ||
  (role === "teacher" ? "Explorium Teacher" : "Explorium Administrator");
const password = process.env.EXPLORIUM_ACCOUNT_PASSWORD;
if (
  !["admin", "teacher"].includes(role) ||
  !password ||
  password.length < 12 ||
  password.length > 128
) {
  console.error(
    "Set EXPLORIUM_ACCOUNT_PASSWORD to a private 12–128 character password and EXPLORIUM_ACCOUNT_ROLE to admin or teacher.",
  );
  process.exit(1);
}
if (
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
  !/^[a-zA-Z0-9._-]{3,40}$/.test(username)
) {
  console.error("Set a valid account email and username.");
  process.exit(1);
}
const path = resolve(process.env.EXPLORIUM_DB_PATH || "data/explorium.sqlite");
mkdirSync(dirname(path), { recursive: true });
const db = new DatabaseSync(path);
db.exec(
  `PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE COLLATE NOCASE,username TEXT NOT NULL UNIQUE COLLATE NOCASE,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('admin','teacher','student')),status TEXT NOT NULL CHECK(status IN ('active','pending','inactive')),profile_json TEXT NOT NULL DEFAULT '{}',created_at TEXT NOT NULL);`,
);
if (
  db
    .prepare("SELECT id FROM users WHERE email=? OR username=?")
    .get(email.toLowerCase(), username.toLowerCase())
) {
  console.error("That account already exists. No account was overwritten.");
  db.close();
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
const hash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
db.prepare(
  "INSERT INTO users (id,name,email,username,password_hash,role,status,profile_json,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
).run(
  randomUUID(),
  name,
  email.toLowerCase(),
  username.toLowerCase(),
  hash,
  role,
  "active",
  JSON.stringify({ classIds: [], subjectIds: [] }),
  new Date().toISOString(),
);
db.close();
console.log(
  "Account provisioned successfully. Credentials were not written to source files.",
);
