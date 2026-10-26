import { test, expect } from "@playwright/test";
const password = process.env.EXPLORIUM_E2E_PASSWORD!;
test("public website, role gateway, accessible FAQ and WhatsApp inquiry", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.screenshot({ path: "artifacts/home-desktop.png", fullPage: true });
  await expect(
    page.getByRole("heading", { name: /Learning that opens new worlds/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Your space", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Student Space Discover/ }),
  ).toHaveAttribute("href", "/login?role=student");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("button", { name: "How can I enroll my child?" })
    .click();
  await expect(
    page.getByText("Complete the inquiry form below", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "School learning", exact: true })
    .click();
  await expect(page.locator(".program-item")).toHaveCount(3);
  await page.getByLabel("Student’s name").fill("Test learner");
  await page.getByLabel("Guardian’s name").fill("Test guardian");
  await page.getByLabel("Student’s age").fill("12");
  await page
    .getByLabel("WhatsApp number", { exact: true })
    .fill("+910000000000");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("learner@example.test");
  await page.getByLabel("Interested in").selectOption("School Learning");
  await page.getByLabel("Preferred time").selectOption("Evening");
  await page.getByRole("button", { name: "Continue on WhatsApp" }).click();
  const href = await page
    .getByRole("link", { name: "Send your inquiry on WhatsApp" })
    .getAttribute("href");
  expect(href).toContain("https://wa.me/917025375305?text=");
  expect(decodeURIComponent(href!)).toContain("Student: Test learner");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
});
test("student approval, private records, academic workflow and interactive learning", async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/register");
  await page.getByLabel("Full name", { exact: true }).fill("Test Learner");
  await page.getByLabel("Username", { exact: true }).fill("testlearner");
  await page.getByLabel("Email address").fill("learner@example.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByLabel("Guardian name", { exact: true }).fill("Test Guardian");
  await page.getByLabel("Guardian WhatsApp").fill("+910000000000");
  await page.getByLabel("Student age").fill("12");
  await page.getByLabel("Learning program").selectOption("school");
  await page.getByRole("button", { name: "Create student account" }).click();
  await expect(
    page.getByRole("heading", { name: "You’re on the list." }),
  ).toBeVisible();
  let response = await page.request.post("/api/auth/login", {
    data: { identifier: "testlearner", password, role: "student" },
  });
  expect(response.status()).toBe(403);
  await page.goto("/login?role=admin");
  await page.getByLabel("Email or username").fill("testadmin");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Continue to your space" }).click();
  await expect(page).toHaveURL(/\/portal/);
  await page
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("button", { name: /^Students/ })
    .click();
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(page.locator("tbody .status-active")).toBeVisible();
  const students = (
    await (await page.request.get("/api/records/students")).json()
  ).data;
  const student = students.find(
    (s: { username: string }) => s.username === "testlearner",
  );
  response = await page.request.post("/api/records/subjects", {
    data: { title: "Mathematics", department: "school" },
  });
  expect(response.status()).toBe(201);
  const subject = (await response.json()).data;
  response = await page.request.post("/api/records/classes", {
    data: {
      title: "Discovery class",
      studentIds: [student.id],
      subjectIds: [subject.id],
    },
  });
  expect(response.status()).toBe(201);
  const classId = (await response.json()).data.id;
  response = await page.request.post("/api/records/assignments", {
    data: {
      title: "Find a pattern",
      classId,
      subjectId: subject.id,
      description: "Describe a number pattern.",
    },
  });
  expect(response.status()).toBe(201);
  const assignment = (await response.json()).data;
  response = await page.request.post("/api/records/marks", {
    data: {
      title: "First discovery",
      classId,
      studentId: student.id,
      value: 18,
      maxValue: 20,
      status: "published",
    },
  });
  expect(response.status()).toBe(201);
  const uploaded = await page.request.post("/api/files", {
    multipart: {
      classId,
      file: {
        name: "study-notes.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("Real teacher material."),
      },
    },
  });
  expect(uploaded.status()).toBe(201);
  const fileId = (await uploaded.json()).data.id;
  response = await page.request.post("/api/records/resources", {
    data: { title: "Study notes", classId, fileId },
  });
  expect(response.status()).toBe(201);
  response = await page.request.patch("/api/website", {
    data: { academicYear: "2026–2027" },
  });
  expect(response.status()).toBe(200);
  expect(
    (await (await page.request.get("/api/public")).json()).data.settings
      .academicYear,
  ).toBe("2026–2027");
  const learner = await browser.newContext({
    baseURL: "http://localhost:3100",
    reducedMotion: "reduce",
  });
  const learnerPage = await learner.newPage();
  await learnerPage.goto("/login?role=student");
  await learnerPage.getByLabel("Email or username").fill("testlearner");
  await learnerPage.getByLabel("Password", { exact: true }).fill(password);
  await learnerPage
    .getByRole("button", { name: "Continue to your space" })
    .click();
  await expect(learnerPage).toHaveURL(/\/portal/);
  await expect(
    learnerPage.getByRole("heading", { name: /Good to see you, Test/ }),
  ).toBeVisible();
  await learnerPage
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("button", { name: "My progress", exact: true })
    .click();
  await expect(
    learnerPage.getByRole("heading", { name: "Published academic results" }),
  ).toBeVisible();
  await expect(learnerPage.locator(".portal-academic-progress")).toContainText(
    "90%",
  );
  response = await learnerPage.request.post("/api/records/announcements", {
    data: { title: "Forbidden", description: "Should not save" },
  });
  expect(response.status()).toBe(403);
  response = await learnerPage.request.post("/api/submissions", {
    data: {
      assignmentId: assignment.id,
      text: "2, 4, 6: each number increases by two.",
    },
  });
  expect(response.status()).toBe(201);
  response = await learnerPage.request.get(`/api/files/${fileId}`);
  expect(response.status()).toBe(200);
  expect(await response.text()).toBe("Real teacher material.");
  await learnerPage.screenshot({
    path: "artifacts/student-dashboard.png",
    fullPage: true,
  });
  await learnerPage.goto("/learn/school");
  await expect(
    learnerPage.getByRole("heading", { name: "Give an equation a shape." }),
  ).toBeVisible();
  await learnerPage.screenshot({
    path: "artifacts/school-lab.png",
    fullPage: true,
  });
  await learnerPage.getByLabel("Curve coefficient").fill("2");
  await expect(learnerPage.getByText("a = 2.0", { exact: true })).toBeVisible();
  await learnerPage.getByRole("tab", { name: "Physics", exact: true }).click();
  await learnerPage.emulateMedia({ reducedMotion: "no-preference" });
  await learnerPage.getByRole("button", { name: "Start simulation" }).click();
  const pendulum = learnerPage.locator(".learning-pendulum svg g");
  const initial = await pendulum.getAttribute("style");
  await expect.poll(() => pendulum.getAttribute("style")).not.toBe(initial);
  await learnerPage.getByRole("button", { name: "Pause simulation" }).click();
  await learnerPage.getByLabel("Gravity", { exact: true }).selectOption("1.62");
  await expect(learnerPage.locator(".learning-pendulum-reading")).toContainText(
    "6.05",
  );
  await learnerPage
    .getByRole("tab", { name: "Computer Science", exact: true })
    .click();
  await learnerPage.getByRole("button", { name: "Clear all bits" }).click();
  await learnerPage.getByRole("button", { name: "128 bit, off" }).click();
  await expect(learnerPage.locator(".learning-binary-value strong")).toHaveText(
    "128",
  );
  await learnerPage.goto("/learn/madrasa");
  await learnerPage.screenshot({
    path: "artifacts/madrasa-studio.png",
    fullPage: true,
  });
  await learnerPage.getByRole("button", { name: /07 Arabic/ }).click();
  await expect(learnerPage.locator(".learning-study-panel h3")).toHaveText(
    "Arabic",
  );
  for (const checkbox of await learnerPage.getByRole("checkbox").all())
    await checkbox.check();
  await expect(
    learnerPage.getByText("You’re ready. Bring your curiosity to class."),
  ).toBeVisible();
  await learnerPage.emulateMedia({ reducedMotion: "reduce" });
  await learnerPage.setViewportSize({ width: 390, height: 844 });
  expect(
    await learnerPage.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await learnerPage.goto("/portal");
  await learnerPage
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await learnerPage
    .getByRole("button", { name: "Sign out", exact: true })
    .click();
  await expect(learnerPage).toHaveURL("http://localhost:3100/");
  expect(
    (await (await learnerPage.request.get("/api/auth/me")).json()).user,
  ).toBeNull();
  expect(errors).toEqual([]);
  await learner.close();
});

test('email assistance reports missing delivery and rejects invalid reset links',async({page})=>{
  await page.goto('/account');
  await expect(page.getByText('Online email assistance is not available yet.',{exact:false})).toBeVisible();
  await expect(page.getByRole('link',{name:'Contact the academy',exact:true})).toHaveAttribute('href',/^https:\/\/wa.me\/917025375305/);
  await page.goto('/account?action=verify#token=invalid');
  await page.getByRole('button',{name:'Verify email',exact:true}).click();
  await expect(page.getByRole('main').getByRole('alert')).toHaveText('This account link is invalid or expired. Please request a new one.');
});
