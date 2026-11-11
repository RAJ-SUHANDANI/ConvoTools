import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("converter intro stays readable and the privacy guide is designed, responsive, and linked", async ({ page }) => {
  await page.goto("/tools/png-to-jpg");
  await expect(page.locator('html[data-ct-hydrated="true"]')).toHaveCount(1);
  const intro = page.locator(".tool-detail-intro");
  await expect(intro.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(intro.getByText(/Add your file, review the settings/)).toBeVisible();
  const colors = await intro.evaluate((node) => {
    const heading = node.querySelector("h1");
    const description = node.querySelector(":scope > p");
    if (!heading || !description) throw new Error("Missing accessible intro copy");
    return {
      heading: getComputedStyle(heading).color,
      description: getComputedStyle(description).color,
      background: getComputedStyle(node).backgroundColor
    };
  });
  expect(colors.heading).toBe("rgb(255, 254, 246)");
  expect(colors.description).toBe("rgb(226, 238, 235)");
  expect(colors.background).toBe("rgb(22, 49, 58)");

  const trust = page.locator(".tool-trust-guide");
  await trust.scrollIntoViewIfNeeded();
  await expect(trust.getByRole("heading", { name: /Your files/ })).toBeVisible();
  await expect(trust.locator(".tool-trust-destination")).toHaveCount(3);
  await expect(trust.getByRole("link", { name: /Privacy, without the guesswork/ })).toHaveAttribute("href", "/privacy");
  await expect(trust.getByRole("link", { name: /See the actual source/ })).toHaveAttribute("target", "_blank");
  await expect(trust.getByRole("link", { name: /thinking behind ConvoTools/ })).toHaveAttribute("href", "/about");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(audit.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(n => n.target) }))).toEqual([]);
});

test("dashboard sidebar remains available after scrolling and Settings is always in the Workspace group", async ({ page }, testInfo) => {
  await page.goto("/dashboard");
  await expect(page.locator('html[data-ct-hydrated="true"]')).toHaveCount(1);
  const sidebar = page.getByRole("complementary", { name: "Workspace navigation" });
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(sidebar).toBeVisible();
    await expect(sidebar.locator(".dash-nav-group").first().getByRole("button", { name: "Settings" })).toBeVisible();
    await sidebar.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: /^Settings/ })).toBeVisible();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(sidebar.getByRole("button", { name: "Settings" })).toBeVisible();
  } else {
    await expect(sidebar.locator(".dash-nav-group").first().getByRole("button", { name: "Settings" })).toBeVisible();
    const topBefore = await sidebar.evaluate((element) => element.getBoundingClientRect().top);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(200);
    const rect = await sidebar.evaluate((element) => ({
      top: element.getBoundingClientRect().top,
      bottom: element.getBoundingClientRect().bottom,
      position: getComputedStyle(element).position,
      overflow: getComputedStyle(element).overflowY
    }));
    expect(rect.position).toBe("fixed");
    expect(rect.overflow).toBe("auto");
    expect(rect.top).toBe(topBefore);
    expect(rect.top).toBe(0);
    await sidebar.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: /^Settings/ })).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
