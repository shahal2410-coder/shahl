import { db, audit, type User } from "./db";
import { fail, stringField } from "./http";
db.exec(
  "CREATE TABLE IF NOT EXISTS website_settings (id INTEGER PRIMARY KEY CHECK(id=1), payload_json TEXT NOT NULL)",
);
export const defaults = {
  heroDescription:
    "Meaningful Islamic education and modern academic learning, beautifully brought together.",
  philosophyText:
    "At Explorium, timeless values meet modern ways of learning. We make space for questions, celebrate effort, and help every student find their own way forward.",
  academicYear: "",
  enrollmentNote:
    "Tell us a little about your learner. We’ll help you take the next step.",
};
export function websiteSettings() {
  const row = db
    .prepare("SELECT payload_json FROM website_settings WHERE id=1")
    .get() as { payload_json: string } | undefined;
  return {
    ...defaults,
    ...(row ? JSON.parse(row.payload_json) : {}),
  } as typeof defaults;
}
export function updateWebsite(user: User, input: Record<string, unknown>) {
  if (user.role !== "admin")
    fail(403, "Only administrators can edit academy content.");
  const next = websiteSettings();
  for (const key of Object.keys(defaults) as (keyof typeof defaults)[])
    if (input[key] !== undefined)
      next[key] = stringField(input, key, key !== "academicYear", 2000);
  db.prepare(
    "INSERT INTO website_settings(id,payload_json) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET payload_json=excluded.payload_json",
  ).run(JSON.stringify(next));
  audit(user.id, "website.update");
  return next;
}
