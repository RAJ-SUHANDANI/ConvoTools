import { test, expect } from "@playwright/test";
import sharp from "sharp";

test("product examples do real work and retain a usable mobile layout", async ({
  page,
}, info) => {
  await page.goto("/");
  // Both actions need actual separation on desktop and stacked mobile layouts.
  const actions = page.locator(".ps-data-actions");
  await expect(actions).toBeVisible();
  const actionGap = await actions.evaluate((el) => {
    const style = getComputedStyle(el);
    return parseFloat(style.flexDirection === "column" ? style.rowGap : style.columnGap);
  });
  expect(actionGap).toBeGreaterThanOrEqual(12);
  // The ending CTA is a standalone rounded card above the footer.
  const separation = await page.locator(".ct-final-stage").evaluate((cta) => {
    const footer = document.querySelector(".fd-footer");
    if (!footer) throw new Error("Footer missing");
    return footer.getBoundingClientRect().top - cta.getBoundingClientRect().bottom;
  });
  expect(separation).toBeGreaterThanOrEqual(28);
  await page.getByRole("button", { name: "Try removing duplicates" }).click();
  await expect(page.locator(".ps-sheet tbody tr")).toHaveCount(3);
  await expect(page.locator(".ps-sheet-result")).toContainText(
    "One repeated row removed",
  );
  // This is Animate UI's real Shiki-backed typing primitive, not a static textarea.
  const terminal = page.locator(".ct-terminal-codeblock");
  await terminal.scrollIntoViewIfNeeded();
  await expect(terminal.locator("pre")).toContainText('"ready": true', { timeout: 20_000 });
  await page.getByRole("button", { name: "Replay code animation" }).click();
  await expect(terminal.locator("pre")).toContainText('"ready": true', { timeout: 20_000 });
  await page.getByLabel("Try formatting JSON").fill('{"answer":42}');
  await page.getByRole("button", { name: "Format JSON" }).click();
  await expect(page.getByLabel("Try formatting JSON")).toHaveValue(
    '{\n  "answer": 42\n}',
  );
  await expect(terminal.locator("pre")).toContainText('"answer": 42', { timeout: 20_000 });
  await page.getByLabel("Try formatting JSON").fill("broken");
  await page.getByRole("button", { name: "Format JSON" }).click();
  await expect(page.locator(".ps-code")).toContainText(
    "Check the quotes and commas",
  );
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download sample image" }).click();
  const download = await pending;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect((await sharp(Buffer.concat(chunks)).metadata()).width).toBe(800);
  for (const chapter of await page.locator(".ps-chapter").all()) {
    await chapter.scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.screenshot({
    path: info.outputPath("product-playground.png"),
    fullPage: true,
    scale: "css",
  });
  await page.getByRole("button", { name: "Open this sample PDF" }).click();
  await expect(page).toHaveURL(/tools\/organize-pdf$/);
  await expect(page.locator(".operation-card")).toContainText(
    "project-brief.pdf",
  );
});
