import { test, expect, type Page } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import JSZip from "jszip";

// Constrain the renderer's JS heap as well as exercising a phone viewport.
// This is browser emulation, not a claim of testing physical iOS/Android RAM.
test.use({ launchOptions: { args: ["--js-flags=--max-old-space-size=256"] } });
let photo: Buffer;
test.beforeAll(async () => {
  photo = await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="2400"><defs><linearGradient id="g"><stop stop-color="#e6efe6"/><stop offset="1" stop-color="#597a72"/></linearGradient></defs><rect width="1800" height="2400" fill="url(#g)"/><rect x="100" y="100" width="1600" height="2200" rx="20" fill="white"/><text x="200" y="350" font-family="Arial" font-size="80">ConvoTools batch test</text><text x="200" y="500" font-family="Arial" font-size="40">Full-size image retained in each PDF page.</text></svg>')).png().toBuffer();
});
function files(count: number, buffer = photo) {
  return Array.from({ length: count }, (_, i) => ({ name: `page-${String(i+1).padStart(2, "0")}.png`, mimeType: "image/png", buffer }));
}
async function pdfOutput(page: Page) {
  const pending = page.waitForEvent("download", { timeout: 180_000 });
  await page.getByRole("button", { name: "Process & download" }).click();
  const download = await pending; const stream = await download.createReadStream(); const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  return PDFDocument.load(Buffer.concat(chunks));
}

for (const count of [25, 50]) {
  test(`${count} full-size PNG images produce ${count} PDF pages`, async ({ page }, info) => {
    test.setTimeout(180_000);
    const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
    await page.goto("/tools/image-to-pdf");
    await expect(page.locator('html[data-ct-hydrated="true"]')).toHaveCount(1);
    const chooser = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Choose files or drop them here" }).click();
    await (await chooser).setFiles(files(count));
    await expect(page.locator(".operation-file-row")).toHaveCount(count);
    const output = await pdfOutput(page);
    expect(output.getPageCount()).toBe(count);
    for (const pdfPage of output.getPages()) expect(pdfPage.getSize()).toEqual({ width: 1800, height: 2400 });
    await expect(page.locator(".operation-results")).toContainText(`${count} images combined`);
    expect(errors).toEqual([]);
    await info.attach("batch-result", { body: JSON.stringify({ images: count, pdfPages: output.getPageCount(), sourcePixels: 1800*2400, runtimeErrors: errors }), contentType: "application/json" });
  });
}

for (const entry of ["/", "/dashboard"]) {
  test(`${entry} preserves all 50 images when opening the PDF tool`, async ({ page }) => {
    test.setTimeout(120_000);
    const tiny = await sharp({ create: { width: 40, height: 60, channels: 3, background: "#547854" } }).png().toBuffer();
    await page.goto(entry);
    await expect(page.locator('html[data-ct-hydrated="true"]')).toHaveCount(1);
    if (entry === "/") await expect(page.locator(".ct-intro")).toHaveCount(0, { timeout: 12_000 });
    // A global shell hydration marker can precede the dashboard boundary.
    // Open the native picker through its React button so a synthetic change
    // cannot land before that workspace's event handlers have attached.
    const chooser = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: entry === "/" ? /^Choose files$/ : /^Browse files/ }).click();
    await (await chooser).setFiles(files(50, tiny));
    await expect(page.locator(".detected-file-name strong")).toHaveCount(50);
    await page.getByRole("button", { name: "Combine 50 images into PDF" }).click();
    await expect(page).toHaveURL(/\/tools\/image-to-pdf$/);
    await expect(page.locator(".operation-file-row")).toHaveCount(50);
    expect((await pdfOutput(page)).getPageCount()).toBe(50);
  });
}

test("50 image conversions finish sequentially with 50 downloadable outputs", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/tools/png-to-jpg");
  await expect(page.locator('html[data-ct-hydrated="true"]')).toHaveCount(1);
  await page.locator('input[type="file"]').setInputFiles(files(50));
  const archiveDownload = page.waitForEvent("download", { timeout: 180_000 });
  await page.getByRole("button", { name: "Process & download" }).click();
  await expect(page.locator(".operation-results").getByRole("button", { name: /page-\d+\.jpg/ })).toHaveCount(50, { timeout: 180_000 });
  await expect(page.getByRole("button", { name: "Process & download" })).toBeEnabled();
  const archive = await archiveDownload;
  expect(archive.suggestedFilename()).toBe("png-to-jpg-results.zip");
  const stream = await archive.createReadStream(); const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const zip = await JSZip.loadAsync(Buffer.concat(chunks));
  expect(Object.keys(zip.files)).toHaveLength(50);
  expect((await sharp(await zip.file("page-50.jpg")!.async("nodebuffer")).metadata()).width).toBe(1800);
  const pending = page.waitForEvent("download");
  await page.locator(".operation-results").getByRole("button", { name: /page-50\.jpg/ }).click();
  expect((await pending).suggestedFilename()).toBe("page-50.jpg");
});
