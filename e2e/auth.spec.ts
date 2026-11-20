import { test, expect } from "@playwright/test";

test("signup and login", async ({ page }) => {
  const suffix = Date.now();
  const email = `patient-${suffix}@example.test`;

  await page.goto("/signup", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Full name").fill("Playwright Patient");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("Password!123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/login\?registered=1/, { timeout: 30_000 });

  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("Password!123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  await expect(page.getByText("Welcome, Playwright Patient")).toBeVisible();
});
