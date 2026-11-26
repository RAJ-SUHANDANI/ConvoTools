import { test, expect, type Page } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

async function upload(
  page: Page,
  buffer: Buffer,
  name: string,
  mimeType: string,
) {
  const chooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "Choose files or drop them here" })
    .click();
  await (await chooser).setFiles({ name, mimeType, buffer });
  await expect(page.locator(".operation-file-row")).toContainText(name);
}
async function output(page: Page) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Process & download" }).click();
  const stream = await (await pending).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const pdf = await PDFDocument.load(Buffer.concat(chunks));
  await expect(page.locator(".operation-results")).toContainText(
    "images-combined.pdf",
  );
  return pdf;
}

test("PNG/JPEG to PDF works without bitmap decoding or canvas export", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.createImageBitmap = () => {
      throw new Error("Bitmap decoding unavailable");
    };
    HTMLCanvasElement.prototype.toBlob = () => {
      throw new Error("Canvas export unavailable");
    };
  });
  await page.goto("/tools/image-to-pdf");
  const png = await sharp({
    create: { width: 800, height: 400, channels: 4, background: "#54785480" },
  })
    .png()
    .toBuffer();
  await upload(page, png, "transparent.png", "image/png");
  const first = await output(page);
  expect(first.getPageCount()).toBe(1);
  expect(first.getPage(0).getSize()).toEqual({ width: 800, height: 400 });
  const jpeg = await sharp({
    create: { width: 6000, height: 4000, channels: 3, background: "#547854" },
  })
    .jpeg()
    .toBuffer();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Replace selected files" }).click();
  await (
    await chooser
  ).setFiles({ name: "camera.jpg", mimeType: "image/jpeg", buffer: jpeg });
  const second = await output(page);
  expect(second.getPage(0).getSize()).toEqual({ width: 6000, height: 4000 });
  const batch = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Replace selected files" }).click();
  await (
    await batch
  ).setFiles([
    { name: "first.png", mimeType: "image/png", buffer: png },
    { name: "second.jpg", mimeType: "image/jpeg", buffer: jpeg },
  ]);
  const combined = await output(page);
  expect(combined.getPageCount()).toBe(2);
  expect(combined.getPage(0).getWidth()).toBe(800);
  expect(combined.getPage(1).getWidth()).toBe(6000);
  await expect(page.locator(".operation-download-help")).toBeInViewport();
  const manual = page.waitForEvent("download");
  await page.locator(".operation-results").getByRole("button", { name: /images-combined.pdf/ }).click();
  expect((await manual).suggestedFilename()).toBe("images-combined.pdf");
});

test("WEBP and rotated camera images retain their visual orientation", async ({
  page,
}) => {
  await page.goto("/tools/image-to-pdf");
  const webp = await sharp({
    create: { width: 900, height: 400, channels: 3, background: "#547854" },
  })
    .webp()
    .toBuffer();
  await upload(page, webp, "cover.webp", "image/webp");
  expect((await output(page)).getPage(0).getSize()).toEqual({
    width: 900,
    height: 400,
  });
  const camera = await sharp({
    create: { width: 900, height: 400, channels: 3, background: "#547854" },
  })
    .withMetadata({ orientation: 6 })
    .jpeg()
    .toBuffer();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Replace selected files" }).click();
  await (
    await chooser
  ).setFiles({ name: "rotated.jpg", mimeType: "image/jpeg", buffer: camera });
  expect((await output(page)).getPage(0).getSize()).toEqual({
    width: 400,
    height: 900,
  });
});

test("an invalid image gives a useful error and permits a successful retry", async ({
  page,
}) => {
  await page.goto("/tools/image-to-pdf");
  await upload(
    page,
    Buffer.from("This is not an image"),
    "broken.png",
    "image/png",
  );
  await page.getByRole("button", { name: "Process & download" }).click();
  await expect(page.locator(".operation-notice")).toContainText(
    "Could not add broken.png",
  );
  await expect(
    page.getByRole("button", { name: "Process & download" }),
  ).toBeEnabled();
  const png = await sharp({
    create: { width: 100, height: 100, channels: 3, background: "#547854" },
  })
    .png()
    .toBuffer();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Replace selected files" }).click();
  await (
    await chooser
  ).setFiles({ name: "valid.png", mimeType: "image/png", buffer: png });
  expect((await output(page)).getPageCount()).toBe(1);
});

test("a stalled converter download stops processing and explains recovery", async ({
  page,
}) => {
  await page.goto("/tools/image-to-pdf");
  await expect(page.locator('html[data-ct-hydrated="true"]')).toHaveCount(1);
  const png = await sharp({
    create: { width: 100, height: 100, channels: 3, background: "#547854" },
  })
    .png()
    .toBuffer();
  await upload(page, png, "sample.png", "image/png");
  await page.clock.install();
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requested = page.waitForRequest(
    (request) => request.resourceType() === "script",
  );
  await page.route("**/_next/static/chunks/**", async (route) => {
    await waiting;
    await route.abort();
  });
  await page.getByRole("button", { name: "Process & download" }).click();
  await requested;
  await page.clock.fastForward(31_000);
  await expect(page.locator(".operation-notice")).toContainText(
    "converter could not finish loading",
  );
  await expect(
    page.getByRole("button", { name: "Process & download" }),
  ).toBeEnabled();
  await expect(page.locator(".operation-results")).toHaveCount(0);
  release();
  await page.unrouteAll({ behavior: "wait" });
});
