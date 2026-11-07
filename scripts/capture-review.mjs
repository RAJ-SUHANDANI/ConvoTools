import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const base = process.env.REVIEW_URL || "http://127.0.0.1:3100";
const output = path.resolve(process.env.REVIEW_OUTPUT || "test-results/review");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
});
try {
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["phone", 390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(output, name + "-home.png") });
    for (const section of await page.locator(".ps-chapter").all()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(950);
    }
    await page.screenshot({
      path: path.join(output, name + "-full.png"),
      fullPage: true,
    });
    await page.locator(".ps-images").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(output, name + "-image-studio.png"),
    });
    for (const [route, label] of [
      ["/dashboard", "workspace"],
      ["/tools/png-to-jpg", "tool"],
      ["/tools/word-editor", "editor"],
      ["/tools/json-formatter", "json"],
    ]) {
      const response = await page.goto(base + route, {
        waitUntil: "networkidle",
      });
      if (response.status() !== 200)
        throw new Error(route + " returned " + response.status());
      if (!(await page.getByRole("heading", { level: 1 }).count()))
        throw new Error(route + " has no title");
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
        throw new Error(route + " overflows the " + name + " viewport");
      await page.screenshot({
        path: path.join(output, name + "-" + label + ".png"),
        fullPage: true,
      });
    }
    console.log(
      JSON.stringify({ viewport: name, base, runtimeErrors: errors, output }),
    );
    if (errors.length) throw new Error("Browser errors detected");
    await page.close();
  }
} finally {
  await browser.close();
}
