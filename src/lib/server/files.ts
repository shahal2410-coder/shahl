import { randomUUID } from "node:crypto";
import { db, type User } from "./db";
import { classIdsFor, visibleRecords } from "./records";
import { fail } from "./http";
db.exec(
  `CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id), class_id TEXT NOT NULL, assignment_id TEXT, name TEXT NOT NULL, mime TEXT NOT NULL, bytes BLOB NOT NULL, created_at TEXT NOT NULL);`,
);
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export function fileType(bytes: Buffer, name: string) {
  if (bytes.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return "image/jpeg";
  if (
    bytes.subarray(0, 4).toString() === "RIFF" &&
    bytes.subarray(8, 12).toString() === "WEBP"
  )
    return "image/webp";
  if (/\.txt$/i.test(name) && !bytes.includes(0)) {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      return "text/plain";
    } catch {}
  }
  fail(400, "Use a PDF, PNG, JPEG, WebP, or UTF-8 text document.");
}
export function storeFile(
  user: User,
  input: { classId: string; assignmentId: string; name: string; bytes: Buffer },
) {
  const { classId, assignmentId, bytes } = input;
  if (!bytes.length || bytes.length > MAX_FILE_BYTES)
    fail(400, "Choose a file smaller than 8 MB.");
  if (!classIdsFor(user).has(classId))
    fail(403, "Choose a class assigned to your account.");
  if (
    user.role === "student" &&
    !visibleRecords(user, "assignments").some(
      (item) => item.id === assignmentId && item.classId === classId,
    )
  )
    fail(403, "Choose an assignment available to you.");
  const mime = fileType(bytes, input.name);
  const id = randomUUID();
  const name =
    input.name.replace(/[^a-zA-Z0-9._ ()-]/g, "_").slice(0, 120) || "document";
  db.prepare(
    "INSERT INTO files (id,owner_id,class_id,assignment_id,name,mime,bytes,created_at) VALUES (?,?,?,?,?,?,?,?)",
  ).run(
    id,
    user.id,
    classId,
    assignmentId || null,
    name,
    mime,
    bytes,
    new Date().toISOString(),
  );
  return { id, name, mime, size: bytes.length };
}
export function readableFile(user: User, id: string) {
  const row = db
    .prepare(
      "SELECT files.*,users.role AS owner_role FROM files JOIN users ON users.id=files.owner_id WHERE files.id=?",
    )
    .get(id) as
    | {
        id: string;
        owner_id: string;
        class_id: string;
        owner_role: string;
        name: string;
        mime: string;
        bytes: Uint8Array;
      }
    | undefined;
  if (!row) fail(404, "File not found.");
  if (
    user.role !== "admin" &&
    row.owner_id !== user.id &&
    (!classIdsFor(user).has(row.class_id) ||
      (user.role === "student" && row.owner_role === "student"))
  )
    fail(403, "This file is not available to your account.");
  return row;
}
