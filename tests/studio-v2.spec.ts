import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the interactive Animate UI studio changes the real tool destination", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Everything");
  const choice = page.getByRole("button", { name: /PNG to JPG/ }).first();
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".ct-motion-output-label")).toContainText("PNG");
  await expect(page.locator(".ct-motion-output-label")).toContainText("JPG");
  await page.getByRole("link", { name: /Open PNG to JPG/ }).click();
  await expect(page).toHaveURL(/\/tools\/png-to-jpg$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("the 3D entrance does not block use of the page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".ct-intro")).toHaveCount(0, { timeout: 12_000 });
  await page.getByRole("link", { name: /Start with a file/ }).click();
  await expect(page).toHaveURL(/#file-desk$/);
});

test("privacy and about provide searchable, accessible answers", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Privacy");
  await expect(page.getByRole("heading", { name: /What data is handled, and why/ })).toBeVisible();
  await expect(page.locator("script[type='application/ld+json']")).not.toHaveCount(0);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations.map(v=>({ id:v.id, nodes:v.nodes.map(n=>n.target) }))).toEqual([]);
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Less file friction");
});

test("unknown tool routes show a useful 404 instead of a broken application", async ({ page }) => {
  await page.goto("/tools/not-a-real-tool-xyz");
  await expect(page.getByRole("heading", { name: "This page went missing." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Back home/ })).toBeVisible();
  await expect(page.locator("main.ct-state-page")).toBeVisible();
});

test("every working converter links to the transparent privacy policy", async ({ page }) => {
  await page.goto("/tools/png-to-jpg");
  await expect(page.getByRole("link", { name: "Privacy", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Privacy details/ })).toBeVisible();
  await expect(page.locator("script[type='application/ld+json']").first()).toBeAttached();
});
