import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import * as XLSX from "xlsx";
import { PDFDocument } from "pdf-lib";

test("the desk is readable, accessible and fits the viewport", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Your files.In good hands.",
  );
  await expect(page.locator(".fd-tool")).toHaveCount(9);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  expect(errors).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath("home-fold.png"),
    scale: "css",
  });
  await page.screenshot({
    path: testInfo.outputPath("homepage.png"),
    fullPage: true,
    scale: "css",
  });
});

test("format preview responds to a choice and leads to the matching tool", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "PNG JPG" }).click();
  await expect(page.getByRole("button", { name: "PNG JPG" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".fd-paper-result .fd-file-extension")).toHaveText(
    ".jpg",
  );
  await page
    .getByRole("link", { name: "Open PNG to JPG", exact: true })
    .click();
  await expect(page).toHaveURL(/\/tools\/png-to-jpg$/);
});

test("search, filters, empty state and the complete library work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore all 42 tools" }).click();
  await expect(page.locator(".fd-tool")).toHaveCount(42);
  await page.getByRole("button", { name: "Images", exact: true }).click();
  await expect(page.locator(".fd-tool")).toHaveCount(7);
  await page.getByRole("searchbox", { name: "Search tools" }).fill("resize");
  await expect(page.locator(".fd-tool")).toHaveCount(1);
  await expect(page.locator(".fd-tool h4")).toHaveText("Resize image");
  await page
    .getByRole("searchbox", { name: "Search tools" })
    .fill("nothing-matches-this");
  await expect(
    page.getByRole("heading", { name: "No tools found for that." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset search" }).click();
  await expect(page.locator(".fd-tool")).toHaveCount(9);
  await page.getByRole("button", { name: "AI lab", exact: true }).click();
  await expect(page.locator(".fd-tool-soon")).toHaveCount(4);
  await expect(page.locator(".fd-tool-soon").first()).toContainText(
    "Coming soon",
  );
});

test("a selected file survives navigation and produces a valid spreadsheet", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Choose files for your file desk")
    .setInputFiles({
      name: "sample.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("Name,Count\nDesign,3\nCode,7"),
    });
  await expect(page.locator(".detected-file-name strong")).toHaveText(
    "sample.csv",
  );
  await page.getByRole("button", { name: /Convert to Excel/ }).click();
  await page.getByRole("button", { name: "Open tool", exact: true }).click();
  await expect(page).toHaveURL(/\/tools\/csv-to-xlsx$/);
  await expect(page.locator(".operation-file-row")).toContainText("sample.csv");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Process & download" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const bytes = Buffer.concat(chunks);
  const workbook = XLSX.read(bytes, { type: "buffer" });
  expect(
    XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
      header: 1,
    }),
  ).toEqual([
    ["Name", "Count"],
    ["Design", 3],
    ["Code", 7],
  ]);
});

test("file removal and empty-file feedback are usable", async ({ page }) => {
  await page.goto("/");
  const picker = page.getByLabel("Choose files for your file desk");
  await picker.setInputFiles({
    name: "empty.txt",
    mimeType: "text/plain",
    buffer: Buffer.alloc(0),
  });
  await expect(
    page.getByRole("status").filter({ hasText: "Empty files were skipped" }),
  ).toBeVisible();
  await picker.setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Notes"),
  });
  await page.getByRole("button", { name: "Remove notes.txt" }).click();
  await expect(page.locator(".detected-file-card")).toHaveCount(0);
});

test("PDF output still preserves typed-array bytes", async ({ page }) => {
  const source = await PDFDocument.create();
  source.addPage([300, 400]);
  const buffer = Buffer.from(await source.save());
  await page.goto("/tools/merge-pdf");
  await page.locator("input[type=file]").setInputFiles([
    { name: "one.pdf", mimeType: "application/pdf", buffer },
    { name: "two.pdf", mimeType: "application/pdf", buffer },
  ]);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Process & download" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const output = await PDFDocument.load(Buffer.concat(chunks));
  expect(output.getPageCount()).toBe(2);
});

test("FAQ and mobile navigation expose their state", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByText("Do my files leave my device?", { exact: true }).click();
  await expect(page.locator("details").first()).toHaveAttribute("open", "");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(
      page.getByRole("button", { name: "Close navigation" }),
    ).toHaveAttribute("aria-expanded", "true");
    await page
      .locator("#fd-mobile-nav")
      .getByRole("link", { name: "The toolkit" })
      .click();
    await expect(page.locator("#fd-mobile-nav")).toBeHidden();
  }
});

test("reduced motion retains content and keyboard search works", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.locator("body").press("/");
  await expect(
    page.getByRole("searchbox", { name: "Search tools" }),
  ).toBeFocused();
  expect(
    await page
      .locator(".fd-slip-first")
      .evaluate((el) => getComputedStyle(el).transform),
  ).toBe("none");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
});

test("workspace and image tool share a usable responsive surface", async ({
  page,
}, testInfo) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: testInfo.outputPath("workspace.png"),
    fullPage: true,
  });
  await page.goto("/tools/png-to-jpg");
  await expect(
    page.getByRole("button", { name: "Process & download" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: testInfo.outputPath("tool.png"),
    fullPage: true,
  });
  await page.goto("/tools/json-formatter");
  await expect(page.getByRole("heading", { level: 1, name: "JSON Studio" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Editor navigation" })).toBeVisible();
});
