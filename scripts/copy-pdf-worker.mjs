import { copyFile, mkdir, access } from "node:fs/promises";
import { resolve } from "node:path";

const candidates = [
  resolve("node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs"),
  resolve("node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
];

let source = "";
for (const candidate of candidates) {
  try {
    await access(candidate);
    source = candidate;
    break;
  } catch {
    // Try the unminified legacy worker next.
  }
}

if (!source) {
  throw new Error(
    "Could not find the PDF.js legacy worker in node_modules/pdfjs-dist. " +
    "Check that pdfjs-dist is installed and that its worker files are included."
  );
}

await mkdir(resolve("public"), { recursive: true });
await copyFile(source, resolve("public/pdf.worker.mjs"));
console.log("Copied PDF.js worker to public/pdf.worker.mjs");
