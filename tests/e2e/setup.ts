import { execFileSync } from "node:child_process";
export default function setup() {
  execFileSync(process.execPath, ["scripts/create-admin.mjs"], {
    env: {
      ...process.env,
      EXPLORIUM_DB_PATH: process.env.EXPLORIUM_TEST_DB,
      EXPLORIUM_ACCOUNT_PASSWORD: process.env.EXPLORIUM_E2E_PASSWORD,
      EXPLORIUM_ACCOUNT_EMAIL: "admin@example.test",
      EXPLORIUM_ACCOUNT_USERNAME: "testadmin",
      EXPLORIUM_ACCOUNT_NAME: "Test administrator",
    },
    stdio: "pipe",
  });
}
