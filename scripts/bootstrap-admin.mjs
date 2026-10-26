import {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
} from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const databasePath = resolve(process.env.EXPLORIUM_DB_PATH || "data/explorium.sqlite");
if (process.env.RAILWAY_ENVIRONMENT && !databasePath.startsWith("/app/data/")) {
  console.error("Mount Railway's persistent volume at /app/data and set EXPLORIUM_DB_PATH to /app/data/explorium.sqlite.");
  process.exit(1);
}
const password = process.env.EXPLORIUM_ACCOUNT_PASSWORD;
if (!password || password.length < 12 || password.length > 128) {
  console.error("Set EXPLORIUM_ACCOUNT_PASSWORD to a private 12–128 character value in Railway Variables.");
  process.exit(1);
}
const email = (process.env.EXPLORIUM_ACCOUNT_EMAIL || "exploriumadmin@gmail.com").trim().toLowerCase();
const username = (process.env.EXPLORIUM_ACCOUNT_USERNAME || "administrator").trim().toLowerCase();
const name = process.env.EXPLORIUM_ACCOUNT_NAME || "Explorium Administrator";
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[a-z0-9._-]{3,40}$/.test(username)) {
  console.error("Set a valid EXPLORIUM_ACCOUNT_EMAIL and EXPLORIUM_ACCOUNT_USERNAME.");
  process.exit(1);
}

mkdirSync(dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','teacher','student')),
    status TEXT NOT NULL CHECK(status IN ('active','pending','inactive')),
    profile_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL
  );
`);
db.exec("BEGIN IMMEDIATE");
try {
  if (db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get()) {
    db.exec("COMMIT");
    console.log("Administrator already exists; existing credentials were left unchanged.");
  } else {
    if (db.prepare("SELECT id FROM users WHERE email = ? OR username = ?").get(email, username)) {
      throw new Error("The requested administrator email or username is already assigned to another account.");
    }
    const salt = randomBytes(16).toString("hex");
    const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
    db.prepare("INSERT INTO users (id,name,email,username,password_hash,role,status,profile_json,created_at) VALUES (?,?,?,?,?,'admin','active',?,?)").run(
      randomUUID(), name, email, username, passwordHash,
      JSON.stringify({ classIds: [], subjectIds: [] }), new Date().toISOString(),
    );
    db.exec("COMMIT");
    console.log("Initial administrator provisioned successfully; credentials were not logged.");
  }
} catch (error) {
  db.exec("ROLLBACK");
  console.error(error instanceof Error ? error.message : "Administrator provisioning failed.");
  process.exitCode = 1;
} finally {
  db.close();
}
