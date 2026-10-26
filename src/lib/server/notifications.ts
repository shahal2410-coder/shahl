import { randomUUID } from "node:crypto";
import { db } from "./db";

db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    actor_id TEXT REFERENCES users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    href TEXT NOT NULL,
    read_at TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS notifications_user_created ON notifications(user_id, created_at DESC);
`);

export type NotificationInput = {
  type: string;
  title: string;
  body: string;
  href: string;
};

export function notifyUsers(userIds: string[], actorId: string | null, message: NotificationInput) {
  const now = new Date().toISOString();
  const insert = db.prepare("INSERT INTO notifications (id,user_id,actor_id,type,title,body,href,created_at) VALUES (?,?,?,?,?,?,?,?)");
  const uniqueIds = [...new Set(userIds)].filter((id) => id !== actorId);
  for (const userId of uniqueIds) {
    insert.run(randomUUID(), userId, actorId, message.type, message.title, message.body.slice(0, 500), message.href, now);
  }
}

export function notifyRole(role: "admin" | "teacher" | "student", actorId: string | null, message: NotificationInput) {
  const users = db.prepare("SELECT id FROM users WHERE role=? AND status='active'").all(role) as {id:string}[];
  notifyUsers(users.map((user) => user.id), actorId, message);
}

export function notifyClass(classId: string, actorId: string | null, message: NotificationInput) {
  const row = db.prepare("SELECT payload_json FROM records WHERE collection='classes' AND id=?").get(classId) as {payload_json:string}|undefined;
  if (!row) return;
  const klass = JSON.parse(row.payload_json) as {teacherId?:string;studentIds?:string[]};
  const users = db.prepare("SELECT id,profile_json FROM users WHERE role='student' AND status='active'").all() as {id:string;profile_json:string}[];
  const recipients = users.filter((user) => (klass.studentIds || []).includes(user.id) || (JSON.parse(user.profile_json).classIds || []).includes(classId)).map((user) => user.id);
  if (klass.teacherId) recipients.push(klass.teacherId);
  notifyUsers(recipients, actorId, message);
}
