import { defineConfig } from "@playwright/test";
import { randomBytes } from "node:crypto";
process.env.EXPLORIUM_E2E_PASSWORD ||= randomBytes(24).toString("hex");
process.env.EXPLORIUM_TEST_DB ||= `/tmp/explorium-e2e-${process.pid}.sqlite`;
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3100",
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://localhost:3100/api/public",
    timeout: 60000,
    reuseExistingServer: false,
    env: { EXPLORIUM_DB_PATH: process.env.EXPLORIUM_TEST_DB!, RESEND_API_KEY:"", EXPLORIUM_EMAIL_FROM:"", EXPLORIUM_APP_URL:"", EXPLORIUM_REQUIRE_VERIFIED_EMAIL:"false" },
  },
  globalSetup: "./tests/e2e/setup.ts",
});
