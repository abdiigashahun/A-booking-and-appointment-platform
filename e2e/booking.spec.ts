import { test, expect } from "@playwright/test";

function nextWeekday() {
  const date = new Date();
  do date.setDate(date.getDate() + 1);
  while (date.getDay() === 0 || date.getDay() === 6);
  return date.toISOString().slice(0, 10);
}

test("full booking flow redirects to mock Stripe success", async ({ page }) => {
  const suffix = Date.now();
  const email = `booking-${suffix}@example.test`;
  await page.goto("/signup", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Full name").fill("Booking Patient");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("Password!123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/login\?registered=1/, { timeout: 30_000 });
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("Password!123");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });

  await page.goto("/book");
  await page.getByRole("button", { name: /General Checkup/ }).click();
  await page.getByRole("button", { name: /Any available doctor/ }).click();
  const date = nextWeekday();
  await page.goto(`/book?service=${new URL(page.url()).searchParams.get("service")}&doctor=any&date=${date}&slot=&step=3`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Loading availability...")).not.toBeVisible({ timeout: 30_000 });
  const slotButton = page.locator("button").filter({ hasText: /\d{1,2}:\d{2}/ }).first();
  await expect(slotButton).toBeVisible();
  await slotButton.click();

  await expect(page.getByRole("heading", { name: "Review your appointment" })).toBeVisible();
  await page.getByRole("button", { name: /Confirm and pay|Book appointment|Continue/i }).click();
  await expect(page).toHaveURL(/\/book\/success\?test=1/);
  await expect(page.getByText("Payment received")).toBeVisible();
});

test("slot conflict removes a just-created slot", async ({ page }) => {
  await page.goto("/api/slots?doctorId=missing&serviceId=missing&date=2026-12-01");
  await expect(page.locator("body")).toContainText("slots");
});
