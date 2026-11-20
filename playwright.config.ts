import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  timeout: 180_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
      },
    },
  ],
  webServer: {
    command: "npx prisma generate && npx prisma db push --skip-generate && npm run prisma -- db seed && npm run build && npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 600_000,
    env: {
      PLAYWRIGHT_TEST: "1",
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
      AUTH_URL: "http://127.0.0.1:3000",
    },
  },
});
