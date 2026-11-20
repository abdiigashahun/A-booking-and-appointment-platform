import { test, expect } from "@playwright/test";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

test("admin login and doctor creation", async ({ page }) => {
  const db = new PrismaClient();
  const email = `admin-${Date.now()}@example.test`;
  await db.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Playwright Admin",
      email,
      passwordHash: await bcrypt.hash("AdminPassword!123", 12),
      role: Role.ADMIN,
    },
  });
  await db.$disconnect();

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("AdminPassword!123");
  await page.getByRole("button", { name: "Log in" }).click();
  try {
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  } catch {
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill("AdminPassword!123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  }

  await page.goto("/admin/doctors");
  await expect(page.getByRole("heading", { name: "Doctors" })).toBeVisible();
  const name = `Dr. Playwright ${Date.now()}`;
  const form = page.getByRole("button", { name: "Add doctor" }).locator("xpath=ancestor::form");
  await form.locator('input[name="name"]').fill(name);
  await form.locator('input[name="bio"]').fill("Created by Playwright.");
  await page.getByRole("button", { name: "Add doctor" }).click();
  await expect(page.getByText(name)).toBeVisible();
});
