import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const directory = mkdtempSync(join(tmpdir(), "explorium-tests-"));
process.env.RESEND_API_KEY = "";
process.env.EXPLORIUM_DB_PATH = join(directory, "test.sqlite");
const { db, records, publicUser, userById } = await import(
  "../src/lib/server/db"
);
const { createUser, verifyPassword } = await import("../src/lib/server/auth");
const { mutateRecord, visibleRecords, submitAssignment } = await import(
  "../src/lib/server/records"
);
const { ApiError } = await import("../src/lib/server/http");
const account = (name: string) => ({
  name,
  email: `${name}@example.test`,
  username: name,
  password: "a-long-test-only-password",
});
const admin = createUser(account("admin"), "admin");
const teacher = createUser(account("teacher"), "teacher");
const outsider = createUser(account("outsider"), "teacher");
const student = createUser(account("student"), "student");
const otherStudent = createUser(account("otherstudent"), "student");
const subject = mutateRecord(admin, "subjects", "POST", {
  title: "Mathematics",
  department: "school",
});
const classA = mutateRecord(admin, "classes", "POST", {
  title: "Class A",
  teacherId: teacher.id,
  studentIds: [student.id],
  subjectIds: [subject.id],
});
const classB = mutateRecord(admin, "classes", "POST", {
  title: "Class B",
  teacherId: outsider.id,
  studentIds: [otherStudent.id],
});
after(() => {
  db.close();
  rmSync(directory, { recursive: true, force: true });
});
test("passwords use salted hashes and never appear in public account data", () => {
  const row = userById(admin.id)!;
  assert.notEqual(row.password_hash, account("admin").password);
  assert.equal(
    verifyPassword(account("admin").password, row.password_hash),
    true,
  );
  assert.equal(verifyPassword("incorrect", row.password_hash), false);
  assert.equal("password_hash" in publicUser(row), false);
});
test("teacher sees only students assigned to their classes", () => {
  assert.deepEqual(
    visibleRecords(teacher, "students").map((item) => item.id),
    [student.id],
  );
  assert.deepEqual(
    visibleRecords(student, "students").map((item) => item.id),
    [student.id],
  );
});
test("teacher cannot write another class and student cannot create learning records", () => {
  assert.throws(
    () =>
      mutateRecord(teacher, "assignments", "POST", {
        title: "Forbidden",
        classId: classB.id,
      }),
    (error) => error instanceof ApiError && error.status === 403,
  );
  assert.throws(
    () =>
      mutateRecord(student, "resources", "POST", {
        title: "Forbidden",
        classId: classA.id,
      }),
    (error) => error instanceof ApiError && error.status === 403,
  );
});
test("marks stay private until administrator publication and remain student scoped", () => {
  const mark = mutateRecord(teacher, "marks", "POST", {
    title: "Algebra",
    classId: classA.id,
    studentId: student.id,
    subjectId: subject.id,
    value: 18,
    maxValue: 20,
    status: "draft",
  });
  assert.equal(visibleRecords(student, "marks").length, 0);
  assert.throws(
    () =>
      mutateRecord(teacher, "marks", "PATCH", {
        id: mark.id,
        status: "published",
      }),
    (error) => error instanceof ApiError && error.status === 403,
  );
  mutateRecord(admin, "marks", "PATCH", { id: mark.id, status: "published" });
  assert.equal(visibleRecords(student, "marks").length, 1);
  assert.equal(visibleRecords(otherStudent, "marks").length, 0);
});
test("teacher cannot forge attendance for a student outside the class", () => {
  assert.throws(
    () =>
      mutateRecord(teacher, "attendance", "POST", {
        classId: classA.id,
        studentId: otherStudent.id,
        date: "2026-10-25",
        status: "present",
      }),
    (error) => error instanceof ApiError && error.status === 400,
  );
  mutateRecord(teacher, "attendance", "POST", {
    classId: classA.id,
    studentId: student.id,
    date: "2026-10-25",
    status: "present",
  });
  assert.throws(
    () =>
      mutateRecord(teacher, "attendance", "POST", {
        classId: classA.id,
        studentId: student.id,
        date: "2026-10-25",
        status: "absent",
      }),
    (error) => error instanceof ApiError && error.status === 409,
  );
});
test("student submission saves actual work and teacher can review it", () => {
  const assignment = mutateRecord(teacher, "assignments", "POST", {
    title: "Fractions",
    classId: classA.id,
  });
  assert.throws(
    () =>
      submitAssignment(otherStudent, {
        assignmentId: assignment.id,
        text: "No access",
      }),
    (error) => error instanceof ApiError && error.status === 404,
  );
  const submission = submitAssignment(student, {
    assignmentId: assignment.id,
    text: "1/2 + 1/4 = 3/4",
  });
  mutateRecord(teacher, "submissions", "PATCH", {
    id: submission.id,
    status: "reviewed",
    feedback: "Correct addition.",
  });
  assert.equal(
    visibleRecords(student, "submissions")[0].feedback,
    "Correct addition.",
  );
  assert.equal(records("submissions").length, 1);
});
test("untrusted executable links are rejected", () => {
  assert.throws(
    () =>
      mutateRecord(teacher, "resources", "POST", {
        title: "Unsafe",
        classId: classA.id,
        url: "javascript:alert(1)",
      }),
    (error) => error instanceof ApiError && error.status === 400,
  );
});
test("pending accounts can be approved without losing profile data", () => {
  const pending = createUser(
    {
      ...account("newstudent"),
      guardianName: "Guardian",
      guardianPhone: "+910000000000",
      age: 11,
      program: "School Learning",
    },
    "student",
    "pending",
  );
  const approved = mutateRecord(admin, "students", "PATCH", {
    id: pending.id,
    status: "active",
    classIds: [classA.id],
  });
  assert.equal(approved.status, "active");
  assert.equal(approved.guardianName, "Guardian");
  assert.ok(
    visibleRecords(teacher, "students").some((item) => item.id === pending.id),
  );
});
test("student and teacher records cannot be promoted to administrator through mutations", () => {
  const updated = mutateRecord(admin, "students", "PATCH", {
    id: student.id,
    role: "admin",
  });
  assert.equal(updated.role, "student");
  assert.throws(
    () =>
      mutateRecord(teacher, "students", "PATCH", {
        id: student.id,
        status: "inactive",
      }),
    (error) => error instanceof ApiError && error.status === 403,
  );
});
test("account deactivation preserves existing academic records", () => {
  mutateRecord(admin, "students", "DELETE", { id: student.id });
  assert.equal(userById(student.id)?.status, "inactive");
  assert.equal(records("marks").length, 1);
});

const { storeFile, readableFile, fileType } = await import(
  "../src/lib/server/files"
);
const { newEmailToken, applyEmailToken, emailAvailable } = await import(
  "../src/lib/server/email"
);
const { websiteSettings, updateWebsite } = await import(
  "../src/lib/server/website"
);
const { assertSameOrigin } = await import("../src/lib/server/http");
test("uploaded assignment files are private to their owner and assigned teacher", () => {
  const learner = createUser(account("uploadlearner"), "student");
  const outsiderStudent = createUser(account("uploadoutsider"), "student");
  const klass = mutateRecord(admin, "classes", "POST", {
    title: "Upload class",
    teacherId: teacher.id,
    studentIds: [learner.id, outsiderStudent.id],
  });
  const assignment = mutateRecord(teacher, "assignments", "POST", {
    title: "Upload task",
    classId: klass.id,
  });
  const uploaded = storeFile(learner, {
    classId: klass.id,
    assignmentId: assignment.id,
    name: "answer.txt",
    bytes: Buffer.from("My learning reflection."),
  });
  assert.equal(
    Buffer.from(readableFile(learner, uploaded.id).bytes).toString(),
    "My learning reflection.",
  );
  assert.equal(readableFile(teacher, uploaded.id).name, "answer.txt");
  assert.throws(
    () => readableFile(outsiderStudent, uploaded.id),
    (error) => error instanceof ApiError && error.status === 403,
  );
  assert.throws(
    () => readableFile(outsider, uploaded.id),
    (error) => error instanceof ApiError && error.status === 403,
  );
  const saved = submitAssignment(learner, {
    assignmentId: assignment.id,
    fileId: uploaded.id,
  });
  assert.equal(saved.fileId, uploaded.id);
  assert.throws(
    () => fileType(Buffer.from("<script>alert(1)</script>"), "attack.html"),
    (error) => error instanceof ApiError && error.status === 400,
  );
});
test("account email tokens expire, can only be used once, and resets revoke sessions", () => {
  const learner = createUser(account("emaillearner"), "student");
  const verify = newEmailToken(learner.id, "verify");
  applyEmailToken(verify, "verify");
  assert.ok(publicUser(userById(learner.id)!).emailVerifiedAt);
  assert.throws(
    () => applyEmailToken(verify, "verify"),
    (error) => error instanceof ApiError && error.status === 400,
  );
  const reset = newEmailToken(learner.id, "reset");
  db.prepare(
    "INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)",
  ).run("test-session", learner.id, Date.now() + 100000);
  applyEmailToken(reset, "reset", "new-private-test-password");
  assert.ok(
    verifyPassword(
      "new-private-test-password",
      userById(learner.id)!.password_hash,
    ),
  );
  assert.equal(
    db
      .prepare("SELECT COUNT(*) AS n FROM sessions WHERE user_id=?")
      .get(learner.id)!.n,
    0,
  );
  const expired = newEmailToken(learner.id, "reset");
  db.prepare("UPDATE email_tokens SET expires_at=0 WHERE user_id=?").run(
    learner.id,
  );
  assert.throws(
    () => applyEmailToken(expired, "reset", "another-test-password"),
    (error) => error instanceof ApiError && error.status === 400,
  );
  assert.equal(emailAvailable(), false);
});
test("website content is persistent and only administrators can change it", () => {
  updateWebsite(admin, { heroDescription: "A new academy introduction." });
  assert.equal(
    websiteSettings().heroDescription,
    "A new academy introduction.",
  );
  assert.throws(
    () => updateWebsite(teacher, { heroDescription: "Forbidden" }),
    (error) => error instanceof ApiError && error.status === 403,
  );
});
test("same-origin requests use the incoming host and reject cross-site requests", () => {
  assert.doesNotThrow(() =>
    assertSameOrigin(
      new Request("http://0.0.0.0:3000/api/auth/login", {
        headers: { host: "localhost:3000", origin: "http://localhost:3000" },
      }),
    ),
  );
  assert.throws(
    () =>
      assertSameOrigin(
        new Request("http://0.0.0.0:3000/api/auth/login", {
          headers: { host: "localhost:3000", origin: "https://attacker.test" },
        }),
      ),
    (error) => error instanceof ApiError && error.status === 403,
  );
});
