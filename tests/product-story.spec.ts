import { test, expect } from "@playwright/test";
import sharp from "sharp";

test("product examples do real work and retain a usable mobile layout", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try removing duplicates" }).click();
  await expect(page.locator(".ps-sheet tbody tr")).toHaveCount(3);
  await expect(page.locator(".ps-sheet-result")).toContainText(
    "One repeated row removed",
  );
  await page.getByLabel("Try formatting JSON").fill('{"answer":42}');
  await page.getByRole("button", { name: "Format JSON" }).click();
  await expect(page.getByLabel("Try formatting JSON")).toHaveValue(
    '{\n  "answer": 42\n}',
  );
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
