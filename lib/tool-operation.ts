"use client";

import type { ProcessOptions, ProcessResult } from "./process-file";
import { withProcessingTimeout } from "./processing-timeout";

export async function runToolOperation(
  files: File[],
  tool: string,
  options: ProcessOptions,
): Promise<ProcessResult[]> {
  options.onProgress?.(0, "Loading the converter…");
  const loadingError = "The converter could not finish loading. Check your connection and try again. If this page was open during an update, reload it and select your files again.";
  const processor = await withProcessingTimeout(
    tool === "Image to PDF"
      ? import("./image-to-pdf").then(
          (module) =>
            (input: File[], _tool: string, settings: ProcessOptions) =>
              module.imagesToPdf(input, settings),
        )
      : import("./process-file").then((module) => module.processFiles),
    30_000,
    loadingError,
  ).catch(() => { throw new Error(loadingError); });
  options.onProgress?.(0.01, "Processing your file locally…");
  let acceptingProgress = true;
  try {
    const output = await withProcessingTimeout(
      processor(files, tool, {
        ...options,
        onProgress: (value, phase) => {
          if (acceptingProgress) options.onProgress?.(value, phase);
        },
      }),
      300_000,
      "Processing did not finish within five minutes. Try a smaller file or fewer files. No output was downloaded; you can try again.",
    );
    if (!output.length || output.some((item) => !item.blob.size))
      throw new Error(
        "The converter returned no usable output. Check the input file and try again.",
      );
    return output;
  } finally {
    acceptingProgress = false;
  }
}

export function downloadToolResult(item: ProcessResult) {
  const url = URL.createObjectURL(item.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = item.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function archiveToolResults(items: ProcessResult[], filename: string): Promise<ProcessResult> {
  const { default: JSZip } = await withProcessingTimeout(import("jszip"), 30_000, "The ZIP packager could not load. Save the individual files below.");
  const zip = new JSZip();
  const used = new Set<string>();
  for (const [index, item] of items.entries()) {
    const original = item.filename || `output-${index + 1}`;
    const dot = original.lastIndexOf(".");
    const base = dot > 0 ? original.slice(0, dot) : original;
    const extension = dot > 0 ? original.slice(dot) : "";
    let name = original, suffix = 2;
    while (used.has(name)) name = `${base} (${suffix++})${extension}`;
    used.add(name); zip.file(name, item.blob);
  }
  const blob = await withProcessingTimeout(zip.generateAsync({ type: "blob", compression: "STORE", streamFiles: true }), 60_000, "The ZIP could not finish packaging. Save the individual files below.");
  return { blob, filename, mime: "application/zip", message: `${items.length} output files bundled into one download.` };
}
