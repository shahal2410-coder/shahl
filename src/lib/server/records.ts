import { randomUUID } from "node:crypto";
import {
  audit,
  db,
  publicUser,
  records,
  userById,
  type User,
  type UserRow,
  type RecordData,
} from "./db";
import { createUser } from "./auth";
import { fail, idArray, stringField } from "./http";

export const collections = [
  "students",
  "teachers",
  "classes",
  "subjects",
  "assignments",
  "announcements",
  "resources",
  "attendance",
  "marks",
  "timetable",
  "instructions",
  "submissions",
  "examinations",
  "events",
] as const;
export function validCollection(collection: string) {
  if (!(collections as readonly string[]).includes(collection))
    fail(404, "This collection does not exist.");
}
export function classIdsFor(user: User): Set<string> {
  const ids = new Set(user.classIds);
  for (const item of records("classes")) {
    if (
      user.role === "admin" ||
      item.teacherId === user.id ||
      (Array.isArray(item.studentIds) && item.studentIds.includes(user.id))
    )
      ids.add(item.id);
  }
  return ids;
}
function isStudentInClass(studentId: string, classId: string): boolean {
  const row = userById(studentId);
  return (
    !!row && row.role === "student" && classIdsFor(publicUser(row)).has(classId)
  );
}
export function visibleRecords(
  user: User,
  collection: string,
): (RecordData | User)[] {
  validCollection(collection);
  const classIds = classIdsFor(user);
  if (collection === "students" || collection === "teachers") {
    const role = collection === "students" ? "student" : "teacher";
    const users = (
      db
        .prepare("SELECT * FROM users WHERE role = ? ORDER BY created_at DESC")
        .all(role) as UserRow[]
    ).map(publicUser);
    if (user.role === "admin") return users;
    if (collection === "students" && user.role === "student")
      return users.filter((item) => item.id === user.id);
    return users.filter((item) =>
      [...classIdsFor(item)].some((id) => classIds.has(id)),
    );
  }
  const all = records(collection);
  if (user.role === "admin") return all;
  if (collection === "subjects") {
    const ids = new Set(user.subjectIds);
    for (const item of records("classes"))
      if (classIds.has(item.id))
        for (const id of (item.subjectIds as string[]) || []) ids.add(id);
    return all.filter((item) => ids.has(item.id));
  }
  if (collection === "classes")
    return all.filter((item) => classIds.has(item.id));
  return all.filter((item) => {
    if (["announcements", "events"].includes(collection) && !item.classId)
      return true;
    if (!classIds.has(String(item.classId))) return false;
    if (
      user.role === "student" &&
      ["attendance", "marks", "submissions"].includes(collection) &&
      item.studentId !== user.id
    )
      return false;
    if (
      user.role === "student" &&
      collection === "marks" &&
      item.status !== "published"
    )
      return false;
    return true;
  });
}
function canWrite(
  user: User,
  collection: string,
  data?: Record<string, unknown>,
) {
  if (user.role === "admin") return;
  if (
    user.role !== "teacher" ||
    ![
      "assignments",
      "resources",
      "attendance",
      "marks",
      "instructions",
      "submissions",
    ].includes(collection)
  )
    fail(403, "Your account cannot make this change.");
  if (!data || !classIdsFor(user).has(String(data.classId)))
    fail(403, "You can only manage your assigned classes.");
  if (
    data.subjectId &&
    !visibleRecords(user, "subjects").some((item) => item.id === data.subjectId)
  )
    fail(403, "You can only manage your assigned subjects.");
  if (collection === "marks" && data.status === "published")
    fail(403, "Only an administrator can publish results.");
}
function validateReferences(data: Record<string, unknown>) {
  if (
    data.classId &&
    !records("classes").some((item) => item.id === data.classId)
  )
    fail(400, "Choose an existing class.");
  if (
    data.subjectId &&
    !records("subjects").some((item) => item.id === data.subjectId)
  )
    fail(400, "Choose an existing subject.");
  if (
    data.studentId &&
    (!data.classId ||
      !isStudentInClass(String(data.studentId), String(data.classId)))
  )
    fail(400, "The student must be assigned to this class.");
}
function cleanRecord(
  collection: string,
  input: Record<string, unknown>,
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const common = ["title", "description", "classId", "subjectId"];
  const additional: Record<string, string[]> = {
    examinations: ["date", "startTime", "endTime"],
    events: ["date", "startTime", "endTime"],
    classes: ["teacherId"],
    subjects: ["department"],
    assignments: ["dueDate", "fileId"],
    announcements: [],
    resources: ["url", "fileId"],
    instructions: [],
    attendance: ["studentId", "date", "status"],
    marks: ["studentId", "status", "remarks"],
    timetable: ["date", "startTime", "endTime", "meetingUrl"],
    submissions: [
      "assignmentId",
      "studentId",
      "text",
      "url",
      "feedback",
      "status",
      "submittedAt",
      "fileId",
    ],
  };
  for (const key of [...common, ...(additional[collection] || [])])
    if (input[key] !== undefined)
      data[key] = stringField(
        input,
        key,
        false,
        ["description", "text", "feedback"].includes(key) ? 10000 : 500,
      );
  if (!["attendance", "submissions"].includes(collection) && !data.title)
    fail(400, "A title is required.");
  if (
    [
      "assignments",
      "resources",
      "instructions",
      "attendance",
      "marks",
      "timetable",
      "examinations",
    ].includes(collection) &&
    !data.classId
  )
    fail(400, "Choose a class.");
  if (collection === "classes") {
    data.studentIds = idArray(input.studentIds, "studentIds");
    data.subjectIds = idArray(input.subjectIds, "subjectIds");
    if (data.teacherId && userById(String(data.teacherId))?.role !== "teacher")
      fail(400, "Choose an existing teacher.");
    for (const id of data.studentIds as string[])
      if (userById(id)?.role !== "student")
        fail(400, "Choose existing students.");
    for (const id of data.subjectIds as string[])
      if (!records("subjects").some((item) => item.id === id))
        fail(400, "Choose existing subjects.");
  }
  if (
    collection === "subjects" &&
    data.department &&
    !["madrasa", "school"].includes(String(data.department))
  )
    fail(400, "Choose Madrasa or School as the department.");
  if (collection === "attendance") {
    if (!data.studentId || !/^\d{4}-\d{2}-\d{2}$/.test(String(data.date)))
      fail(400, "Choose a student and valid date.");
    if (!["present", "absent", "late", "excused"].includes(String(data.status)))
      fail(400, "Choose a valid attendance status.");
    data.title = data.title || `Attendance · ${data.date}`;
  }
  if (collection === "marks") {
    if (!data.studentId) fail(400, "Choose a student.");
    data.value = Number(input.value);
    data.maxValue = Number(input.maxValue);
    if (
      !Number.isFinite(data.value) ||
      !Number.isFinite(data.maxValue) ||
      Number(data.maxValue) <= 0 ||
      Number(data.value) < 0 ||
      Number(data.value) > Number(data.maxValue)
    )
      fail(400, "Enter valid marks between zero and the maximum.");
    data.status = data.status || "draft";
    if (!["draft", "published"].includes(String(data.status)))
      fail(400, "Choose draft or published status.");
  }
  if (
    collection === "submissions" &&
    !["submitted", "reviewed"].includes(String(data.status))
  )
    fail(400, "Choose a valid submission status.");
  for (const key of ["url", "meetingUrl"])
    if (data[key]) {
      try {
        if (!["http:", "https:"].includes(new URL(String(data[key])).protocol))
          fail(400, "Links must use http or https.");
      } catch {
        fail(400, "Enter a valid web link.");
      }
    }
  for (const key of ["date", "dueDate"])
    if (data[key] && !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(String(data[key])))
      fail(400, "Use a valid date.");
  validateReferences(data);
  return data;
}
function mutateUser(
  user: User,
  collection: string,
  method: string,
  input: Record<string, unknown>,
) {
  if (user.role !== "admin")
    fail(403, "Only administrators can manage accounts.");
  const role = collection === "teachers" ? "teacher" : "student";
  if (method === "POST") {
    for (const key of ["classIds", "subjectIds"])
      if (input[key] !== undefined) {
        const known = records(key === "classIds" ? "classes" : "subjects");
        if (
          idArray(input[key], key).some(
            (id) => !known.some((item) => item.id === id),
          )
        )
          fail(
            400,
            `Choose existing ${key === "classIds" ? "classes" : "subjects"}.`,
          );
      }
    const created = createUser(
      input,
      role,
      input.status === "pending" ? "pending" : "active",
    );
    audit(user.id, `${collection}.create`, created.id);
    if (input.classIds !== undefined || input.subjectIds !== undefined)
      return mutateUser(user, collection, "PATCH", {
        id: created.id,
        ...(input.classIds !== undefined ? { classIds: input.classIds } : {}),
        ...(input.subjectIds !== undefined
          ? { subjectIds: input.subjectIds }
          : {}),
      });
    return created;
  }
  const id = stringField(input, "id", true, 100);
  const row = userById(id);
  if (!row || row.role !== role) fail(404, "Account not found.");
  if (method === "DELETE") {
    db.prepare("UPDATE users SET status = 'inactive' WHERE id = ?").run(id);
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(id);
    audit(user.id, `${collection}.deactivate`, id);
    return publicUser(userById(id)!);
  }
  const profile = JSON.parse(row.profile_json);
  for (const key of ["guardianName", "guardianPhone", "program"])
    if (input[key] !== undefined)
      profile[key] = stringField(input, key, false, 150);
  for (const key of ["classIds", "subjectIds"])
    if (input[key] !== undefined) {
      const ids = idArray(input[key], key);
      const known = records(key === "classIds" ? "classes" : "subjects");
      if (ids.some((id) => !known.some((item) => item.id === id)))
        fail(
          400,
          `Choose existing ${key === "classIds" ? "classes" : "subjects"}.`,
        );
      profile[key] = ids;
    }
  if (input.age !== undefined) {
    const age = Number(input.age);
    if (!Number.isInteger(age) || age < 3 || age > 100)
      fail(400, "Enter an age between 3 and 100.");
    profile.age = age;
  }
  const name =
    input.name !== undefined ? stringField(input, "name", true, 100) : row.name;
  const email =
    input.email !== undefined
      ? stringField(input, "email", true, 254).toLowerCase()
      : row.email;
  const username =
    input.username !== undefined
      ? stringField(input, "username", true, 40).toLowerCase()
      : row.username;
  const status = input.status !== undefined ? String(input.status) : row.status;
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !/^[a-z0-9._-]{3,40}$/.test(username)
  )
    fail(400, "Enter a valid email and username.");
  if (!["active", "pending", "inactive"].includes(status))
    fail(400, "Choose an account status.");
  db.prepare(
    "UPDATE users SET name=?,email=?,username=?,status=?,profile_json=? WHERE id=?",
  ).run(name, email, username, status, JSON.stringify(profile), id);
  if (status !== "active")
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(id);
  audit(user.id, `${collection}.update`, id);
  return publicUser(userById(id)!);
}
export function mutateRecord(
  user: User,
  collection: string,
  method: string,
  input: Record<string, unknown>,
): RecordData | User {
  validCollection(collection);
  if (collection === "students" || collection === "teachers")
    return mutateUser(user, collection, method, input);
  const id =
    method === "POST" ? randomUUID() : stringField(input, "id", true, 100);
  const existing =
    method === "POST"
      ? undefined
      : records(collection).find((item) => item.id === id);
  if (method !== "POST" && !existing)
    fail(404, "This record could not be found.");
  if (existing) canWrite(user, collection, existing);
  if (method === "DELETE") {
    db.prepare("DELETE FROM records WHERE id = ? AND collection = ?").run(
      id,
      collection,
    );
    audit(user.id, `${collection}.delete`, id);
    return existing!;
  }
  if (collection === "submissions") {
    if (method === "POST")
      fail(400, "Students submit assignments through the submission form.");
    for (const key of Object.keys(input))
      if (!["id", "feedback", "status"].includes(key))
        fail(400, "Only feedback and review status can be changed.");
  }
  const data = cleanRecord(collection, { ...existing, ...input });
  if (data.fileId) {
    const file = db
      .prepare("SELECT owner_id,class_id FROM files WHERE id=?")
      .get(String(data.fileId)) as
      | { owner_id: string; class_id: string }
      | undefined;
    if (
      !file ||
      file.class_id !== data.classId ||
      (user.role !== "admin" &&
        file.owner_id !== user.id &&
        existing?.fileId !== data.fileId)
    )
      fail(403, "Choose a file uploaded for this class.");
  }
  canWrite(user, collection, data);
  if (
    collection === "attendance" &&
    records(collection).some(
      (item) =>
        item.id !== id &&
        item.studentId === data.studentId &&
        item.classId === data.classId &&
        item.date === data.date,
    )
  )
    fail(
      409,
      "Attendance already exists for this student and date. Edit the existing record.",
    );
  const now = new Date().toISOString();
  if (existing)
    db.prepare(
      "UPDATE records SET payload_json=?,updated_at=? WHERE id=? AND collection=?",
    ).run(JSON.stringify(data), now, id, collection);
  else
    db.prepare(
      "INSERT INTO records (id,collection,payload_json,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?)",
    ).run(id, collection, JSON.stringify(data), user.id, now, now);
  audit(user.id, `${collection}.${existing ? "update" : "create"}`, id);
  return { ...data, id, createdAt: existing?.createdAt || now, updatedAt: now };
}
export function submitAssignment(
  user: User,
  input: Record<string, unknown>,
): RecordData {
  if (user.role !== "student")
    fail(403, "Only students can submit assignments.");
  const assignmentId = stringField(input, "assignmentId", true, 100);
  const assignment = visibleRecords(user, "assignments").find(
    (item) => item.id === assignmentId,
  );
  if (!assignment) fail(404, "This assignment is not available to you.");
  const text = stringField(input, "text", false, 10000);
  const url = stringField(input, "url", false, 500);
  const fileId = stringField(input, "fileId", false, 100);
  if (fileId) {
    const file = db
      .prepare("SELECT owner_id,assignment_id FROM files WHERE id=?")
      .get(fileId) as { owner_id: string; assignment_id: string } | undefined;
    if (
      !file ||
      file.owner_id !== user.id ||
      file.assignment_id !== assignmentId
    )
      fail(403, "Choose a file uploaded for this assignment.");
  }
  if (!text && !url && !fileId)
    fail(400, "Add your answer or a link to your work.");
  const now = new Date().toISOString();
  const data = cleanRecord("submissions", {
    title: assignment.title,
    assignmentId,
    classId: assignment.classId,
    studentId: user.id,
    text,
    url,
    fileId,
    status: "submitted",
    submittedAt: now,
  });
  const existing = records("submissions").find(
    (item) => item.assignmentId === assignmentId && item.studentId === user.id,
  );
  const id = existing?.id || randomUUID();
  if (existing)
    db.prepare("UPDATE records SET payload_json=?,updated_at=? WHERE id=?").run(
      JSON.stringify(data),
      now,
      id,
    );
  else
    db.prepare(
      "INSERT INTO records (id,collection,payload_json,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?)",
    ).run(id, "submissions", JSON.stringify(data), user.id, now, now);
  audit(user.id, "assignment.submit", id);
  return { ...data, id, createdAt: existing?.createdAt || now, updatedAt: now };
}
