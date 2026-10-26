import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

export const databasePath = resolve(
  /* turbopackIgnore: true */ process.env.EXPLORIUM_DB_PATH ||
    "data/explorium.sqlite",
);
mkdirSync(dirname(databasePath), { recursive: true });
const globalDatabase = globalThis as typeof globalThis & {
  exploriumDb?: DatabaseSync;
};
export const db = globalDatabase.exploriumDb || new DatabaseSync(databasePath);
globalDatabase.exploriumDb = db;
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE, password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','teacher','student')),
    status TEXT NOT NULL CHECK(status IN ('active','pending','inactive')),
    profile_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY, collection TEXT NOT NULL, payload_json TEXT NOT NULL,
    created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS records_collection ON records(collection);
  CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY, user_id TEXT, action TEXT NOT NULL, target_id TEXT, created_at TEXT NOT NULL
  );
`);

export type Role = "admin" | "teacher" | "student";
export type UserRow = {
  id: string;
  name: string;
  email: string;
  username: string;
  password_hash: string;
  role: Role;
  status: string;
  profile_json: string;
  created_at: string;
};
export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  status: string;
  classIds: string[];
  subjectIds: string[];
  createdAt: string;
  [key: string]: unknown;
};
export type RecordData = {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};
export function publicUser(row: UserRow): User {
  const profile = JSON.parse(row.profile_json);
  return {
    ...profile,
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username,
    role: row.role,
    status: row.status,
    classIds: profile.classIds || [],
    subjectIds: profile.subjectIds || [],
    createdAt: row.created_at,
  };
}
export function userById(id: string): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | UserRow
    | undefined;
}
export function records(collection: string): RecordData[] {
  const rows = db
    .prepare(
      "SELECT * FROM records WHERE collection = ? ORDER BY created_at DESC",
    )
    .all(collection) as {
    id: string;
    payload_json: string;
    created_at: string;
    updated_at: string;
  }[];
  return rows.map((row) => ({
    ...JSON.parse(row.payload_json),
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
export function audit(
  userId: string | null,
  action: string,
  targetId?: string,
) {
  db.prepare(
    "INSERT INTO audit_log (id,user_id,action,target_id,created_at) VALUES (?,?,?,?,?)",
  ).run(
    randomUUID(),
    userId,
    action,
    targetId || null,
    new Date().toISOString(),
  );
}
