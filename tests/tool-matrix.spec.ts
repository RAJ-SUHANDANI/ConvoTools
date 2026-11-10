import { test, expect, type Page } from "@playwright/test";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun } from "docx";
import PptxGenJS from "pptxgenjs";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import sharp from "sharp";

type Fixture = { name: string; mimeType: string; buffer: Buffer };
const fixtures: Record<string, Fixture> = {};
const names = [
  "PDF to Word",
  "Word to PDF",
  "Image to PDF",
  "Image to Word (OCR)",
  "Merge PDF",
  "Split PDF",
  "Compress PDF",
  "Organize PDF",
  "PDF to JPG",
  "PDF to PNG",
  "PDF to Excel",
  "PDF to PowerPoint",
  "Protect PDF",
  "PNG to JPG",
  "JPG to PNG",
  "PNG to WEBP",
  "WEBP converter",
  "Image compressor",
  "Resize image",
  "Crop & rotate",
  "Image enhancer",
  "Background remover",
  "Photo restoration",
  "OCR extractor",
  "Word editor",
  "DOCX to TXT",
  "Excel to PDF",
  "CSV to XLSX",
  "Remove duplicates",
  "PPTX to PDF",
  "PDF to PPTX",
  "Slides to images",
  "MP4 to GIF",
  "Video compressor",
  "Extract audio",
  "Audio converter",
  "Create ZIP",
  "Extract archive",
  "JSON formatter",
  "Base64 tools",
  "Hash generator",
  "QR generator",
];
const locked = [
  "Image enhancer",
  "Background remover",
  "Photo restoration",
  "OCR extractor",
];
const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

test.beforeAll(async () => {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < 2; i++) {
    const page = pdf.addPage([600, 500]);
    page.drawText("ConvoTools test document", {
      x: 50,
      y: 440,
      size: 23,
      font,
    });
    const rows = [
      ["Item", "Count", "Price"],
      ["Design", "3", "120"],
      ["Code", "7", "240"],
    ];
    rows.forEach((row, r) =>
      row.forEach((cell, c) =>
        page.drawText(cell, {
          x: 50 + c * 140,
          y: 365 - r * 30,
          size: 13,
          font,
        }),
      ),
    );
    page.drawRectangle({
      x: 45,
      y: 290,
      width: 420,
      height: 105,
      borderWidth: 1,
      borderColor: rgb(0.2, 0.2, 0.2),
    });
    page.drawText("Page " + (i + 1), { x: 50, y: 50, size: 12, font });
  }
  fixtures.pdf = {
    name: "sample.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(await pdf.save()),
  };
  const text = Buffer.from(
    "ConvoTools test document. Design, code and deliver.",
  );
  fixtures.txt = { name: "sample.txt", mimeType: "text/plain", buffer: text };
  const svg = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="500"><rect width="1000" height="500" fill="white"/><text x="60" y="180" font-family="Arial" font-size="72" fill="black">CONVOTOOLS 2026</text><text x="60" y="290" font-family="Arial" font-size="48" fill="black">INVOICE TOTAL 360</text></svg>',
  );
  for (const [extension, mimeType] of [
    ["png", "image/png"],
    ["jpg", "image/jpeg"],
    ["webp", "image/webp"],
  ]) {
    fixtures[extension] = {
      name: "sample." + extension,
      mimeType,
      buffer: await sharp(svg)
        .toFormat(extension === "jpg" ? "jpeg" : (extension as "png" | "webp"))
        .toBuffer(),
    };
  }
  fixtures.docx = {
    name: "sample.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: await Packer.toBuffer(
      new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "ConvoTools test document", bold: true }),
                ],
              }),
              new Paragraph("Design, code and deliver."),
            ],
          },
        ],
      }),
    ),
  };
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      ["Item", "Count"],
      ["Design", 3],
      ["Code", 7],
      ["Code", 7],
    ]),
    "Data",
  );
  fixtures.xlsx = {
    name: "sample.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
  };
  fixtures.csv = {
    name: "sample.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("Item,Count\nDesign,3\nCode,7\nCode,7"),
  };
  const presentation = new PptxGenJS();
  presentation
    .addSlide()
    .addText("ConvoTools test presentation", {
      x: 1,
      y: 1,
      w: 8,
      h: 1,
      fontSize: 28,
    });
  fixtures.pptx = {
    name: "sample.pptx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    buffer: Buffer.from(
      (await presentation.write({ outputType: "nodebuffer" })) as ArrayBuffer,
    ),
  };
  fixtures.zip = {
    name: "sample.zip",
    mimeType: "application/zip",
    buffer: await new JSZip()
      .file("sample.txt", text)
      .generateAsync({ type: "nodebuffer" }),
  };
  fixtures.json = {
    name: "sample.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"project":"ConvoTools","count":3}'),
  };
  const rate = 8000,
    length = rate;
  const wav = Buffer.alloc(44 + length * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(length * 2, 40);
  for (let i = 0; i < length; i++)
    wav.writeInt16LE(
      Math.round(Math.sin((i / rate) * 440 * Math.PI * 2) * 6000),
      44 + i * 2,
    );
  fixtures.wav = { name: "sample.wav", mimeType: "audio/wav", buffer: wav };
  const sampleVideo = await fetch("https://www.w3schools.com/html/mov_bbb.mp4");
  if (!sampleVideo.ok)
    throw new Error("Could not fetch the public Big Buck Bunny sample video.");
  fixtures.video = {
    name: "sample.mp4",
    mimeType: "video/mp4",
    buffer: Buffer.from(await sampleVideo.arrayBuffer()),
  };
});

async function downloadBytes(page: Page) {
  const pending = page.waitForEvent("download", { timeout: 210_000 });
  void pending.catch(() => {});
  await page.getByRole("button", { name: "Process & download" }).click();
  await expect(
    page.getByRole("button", { name: "Process & download" }),
  ).toBeEnabled({ timeout: 210_000 });
  if (!(await page.locator(".operation-results").count()))
    throw new Error(
      "Conversion failed: " +
        (await page.locator(".operation-notice").innerText()),
    );
  const download = await pending;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  return { name: download.suggestedFilename(), bytes: Buffer.concat(chunks) };
}

for (const name of names) {
  test("tool matrix: " + name, async ({ page }, info) => {
    test.skip(
      info.project.name !== "desktop",
      "Full engine matrix runs once; responsive interaction coverage runs on both projects.",
    );
    test.setTimeout(240_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto("/tools/" + slug(name));
    expect(response?.status()).toBe(200);
    await expect(page.locator('html[data-ct-hydrated="true"]')).toHaveCount(1);
    if (locked.includes(name)) {
      await expect(page.getByText(/coming soon/i).first()).toBeVisible();
      expect(
        await page.getByRole("button", { name: "Process & download" }).count(),
      ).toBe(0);
      await info.attach("availability", {
        body: JSON.stringify({
          name,
          status: "Coming soon, intentionally unavailable",
        }),
        contentType: "application/json",
      });
      return;
    }
    if (name === "Word editor") {
      await page
        .locator('input[type="file"]')
        .first()
        .setInputFiles(fixtures.docx);
      await expect(
        page.getByLabel("Editable Word document canvas"),
      ).toContainText("ConvoTools test document");
      const pending = page.waitForEvent("download");
      await page
        .getByRole("button", { name: "Export DOCX", exact: true })
        .click();
      expect((await pending).suggestedFilename()).toMatch(/\.docx$/);
      expect(errors).toEqual([]);
      return;
    }
    if (name === "JSON formatter") {
      await page
        .locator('input[type="file"]')
        .first()
        .setInputFiles(fixtures.json);
      await expect(page.locator(".json-workbench")).toContainText("ConvoTools");
      await expect(page.locator(".json-workbench")).not.toContainText(
        "Invalid JSON",
      );
      expect(errors).toEqual([]);
      return;
    }
    let input =
      name.startsWith("PDF to") ||
      [
        "Merge PDF",
        "Split PDF",
        "Compress PDF",
        "Organize PDF",
        "Protect PDF",
      ].includes(name)
        ? fixtures.pdf
        : ["Word to PDF", "DOCX to TXT"].includes(name)
          ? fixtures.docx
          : ["Excel to PDF", "Remove duplicates"].includes(name)
            ? fixtures.xlsx
            : name === "CSV to XLSX"
              ? fixtures.csv
              : ["PPTX to PDF", "Slides to images"].includes(name)
                ? fixtures.pptx
                : name === "JPG to PNG"
                  ? fixtures.jpg
                  : name === "WEBP converter"
                    ? fixtures.webp
                    : name === "Extract archive"
                      ? fixtures.zip
                      : ["Audio converter"].includes(name)
                        ? fixtures.wav
                        : [
                              "Create ZIP",
                              "Base64 tools",
                              "Hash generator",
                            ].includes(name)
                          ? fixtures.txt
                          : fixtures.png;
    if (["MP4 to GIF", "Video compressor", "Extract audio"].includes(name)) {
      input = fixtures.video;
    }
    if (name === "QR generator")
      await page.getByLabel("Text or URL").fill("https://convotool.vercel.app");
    else
      await page
        .locator('input[type="file"]')
        .setInputFiles(
          name === "Merge PDF"
            ? [input, { ...input, name: "second.pdf" }]
            : input,
        );
    if (name === "Protect PDF")
      await page.getByLabel("PDF password").fill("Test-password-2026");
    if (name === "Resize image") {
      await page.getByLabel("Width (px)").fill("320");
      await page.getByLabel("Height (px)").fill("160");
    }
    const output = await downloadBytes(page);
    expect(output.bytes.length).toBeGreaterThan(25);
    expect(output.bytes.some((value) => value !== 0)).toBeTruthy();
    if (/\.pdf$/.test(output.name) && name !== "Protect PDF")
      expect(
        (await PDFDocument.load(output.bytes)).getPageCount(),
      ).toBeGreaterThan(0);
    if (/\.(docx|pptx|zip)$/.test(output.name))
      expect(
        Object.keys((await JSZip.loadAsync(output.bytes)).files).length,
      ).toBeGreaterThan(0);
    if (/\.xlsx$/.test(output.name))
      expect(
        XLSX.read(output.bytes, { type: "buffer" }).SheetNames.length,
      ).toBeGreaterThan(0);
    if (/\.(png|jpg|webp|gif)$/.test(output.name))
      expect((await sharp(output.bytes).metadata()).width).toBeGreaterThan(0);
    expect(errors).toEqual([]);
    await info.attach("tool-result", {
      body: JSON.stringify({
        name,
        filename: output.name,
        bytes: output.bytes.length,
        runtimeErrors: errors,
      }),
      contentType: "application/json",
    });
  });
}
