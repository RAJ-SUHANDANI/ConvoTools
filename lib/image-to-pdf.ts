"use client";

import { PDFDocument } from "pdf-lib";
import type { ProcessOptions, ProcessResult } from "./process-file";
import { withProcessingTimeout } from "./processing-timeout";
import { MAX_BATCH_FILES } from "./file-limits";

// A normal JPEG can be embedded losslessly. EXIF-rotated camera images need
// browser decoding so their orientation is preserved rather than turned sideways.
function hasExifOrientation(bytes: Uint8Array): boolean {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = 2; offset + 4 < bytes.length;) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    if (marker === 0xda || marker === 0xd9) break;
    const length = view.getUint16(offset + 2);
    if (length < 2 || offset + length + 2 > bytes.length) break;
    if (
      marker === 0xe1 &&
      length >= 16 &&
      view.getUint32(offset + 4) === 0x45786966
    ) {
      const tiff = offset + 10,
        end = offset + length + 2;
      const little = view.getUint16(tiff) === 0x4949;
      const directory = tiff + view.getUint32(tiff + 4, little);
      if (directory + 2 > end || directory < tiff) break;
      const count = view.getUint16(directory, little);
      for (let i = 0; i < count && directory + 2 + (i + 1) * 12 <= end; i++) {
        const entry = directory + 2 + i * 12;
        if (view.getUint16(entry, little) === 0x0112) {
          const orientation = view.getUint16(entry + 8, little);
          return orientation >= 2 && orientation <= 8;
        }
      }
    }
    offset += length + 2;
  }
  return false;
}

async function browserImage(file: File, mime = "image/png"): Promise<Uint8Array> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  const canvas = document.createElement("canvas");
  try {
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(
          new Error(
            `Could not read ${file.name}. Try a valid PNG, JPG or WEBP image.`,
          ),
        );
      image.src = url;
    });
    await withProcessingTimeout(
      loaded,
      20_000,
      `The browser could not finish opening ${file.name}. Save a local PNG or JPG copy and try again.`,
    );
    if (
      !image.naturalWidth ||
      !image.naturalHeight ||
      image.naturalWidth * image.naturalHeight > 32_000_000
    )
      throw new Error(
        `${file.name} is too large to decode safely here. Resize it below 32 megapixels and try again.`,
      );
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error(
        "This browser could not create an image canvas. Try a current browser.",
      );
    context.drawImage(image, 0, 0);
    const blob = await withProcessingTimeout(
      new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) =>
            value
              ? resolve(value)
              : reject(
                  new Error(
                    `Could not encode ${file.name}. Try a smaller PNG or JPG image.`,
                  ),
                ),
          mime,
          .95,
        );
      }),
      30_000,
      `Image encoding stalled for ${file.name}. Try a smaller PNG or JPG image.`,
    );
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    image.onload = null;
    image.onerror = null;
    image.src = "";
    URL.revokeObjectURL(url);
    canvas.width = 0;
    canvas.height = 0;
  }
}

export async function imagesToPdf(
  files: File[],
  options: ProcessOptions = {},
): Promise<ProcessResult[]> {
  if (!files.length)
    throw new Error("Choose at least one image to create a PDF.");
  if (files.length > MAX_BATCH_FILES)
    throw new Error(`Choose up to ${MAX_BATCH_FILES} images for one PDF.`);
  const document = await PDFDocument.create();
  for (const [index, file] of files.entries()) {
    options.onProgress?.(
      0.05 + (0.8 * index) / files.length,
      `Preparing image ${index + 1} of ${files.length}: ${file.name}`,
    );
    // Yield before decoding/embedding so the browser can paint the current phase.
    await new Promise((resolve) => setTimeout(resolve, 0));
    const bytes = new Uint8Array(
      await withProcessingTimeout(
        file.arrayBuffer(),
        20_000,
        `Could not finish reading ${file.name}. Download it to this device first, then select it again.`,
      ),
    );
    const png =
      bytes.length >= 8 &&
      bytes[0] === 137 &&
      bytes[1] === 80 &&
      bytes[2] === 78 &&
      bytes[3] === 71;
    const jpeg =
      bytes.length >= 3 &&
      bytes[0] === 255 &&
      bytes[1] === 216 &&
      bytes[2] === 255;
    if (png && bytes.length >= 24) {
      const header = new DataView(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength,
      );
      if (header.getUint32(16) * header.getUint32(20) > 32_000_000)
        throw new Error(
          `${file.name} exceeds the 32-megapixel PNG limit. Resize it before creating a PDF.`,
        );
    }
    let image;
    try {
      // Avoid the old full-resolution canvas -> PNG -> PNG-decode round trip.
      // This also works when createImageBitmap/canvas export is unavailable.
      image = png
        ? await document.embedPng(bytes)
        : jpeg
          ? await document.embedJpg(hasExifOrientation(bytes) ? await browserImage(file, "image/jpeg") : bytes)
          : await document.embedPng(await browserImage(file));
    } catch (error) {
      throw new Error(
        `Could not add ${file.name} to the PDF. ${error instanceof Error ? error.message : "Check that the image is valid and try again."}`,
      );
    }
    const page = document.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
    // pdf-lib otherwise retains each PNG's decoded RGB/alpha planes until
    // document.save(). With 25–50 camera-sized pages that can exhaust mobile
    // memory. Embed/compress now so PDFImage releases its raster embedder
    // before the next page is decoded. The page retains its normal PDF ref.
    await image.embed();
  }
  options.onProgress?.(0.95, "Saving your PDF…");
  const bytes = await document.save();
  // Use a view of pdf-lib's ordinary ArrayBuffer instead of cloning the whole
  // finished PDF once more before Blob construction (costly for 50 pages).
  const storage = bytes.buffer;
  const data = storage instanceof ArrayBuffer
    ? new Uint8Array(storage, bytes.byteOffset, bytes.byteLength)
    : new Uint8Array(bytes);
  const blob = new Blob([data], { type: "application/pdf" });
  return [
    {
      blob,
      filename: "images-combined.pdf",
      mime: blob.type,
      message: `${files.length} image${files.length === 1 ? "" : "s"} combined into one PDF.`,
    },
  ];
}
