export type FileCategory =
  | "Images"
  | "PDF"
  | "Documents"
  | "Spreadsheets"
  | "Presentations"
  | "Video & audio"
  | "Archives"
  | "Developer"
  | "Other";

export type FileAction = {
  id: string;
  label: string;
  detail: string;
  output: string;
  toolSlug: string;
  kind: "convert" | "edit" | "ai" | "extract";
};

const extensions: Record<FileCategory, string[]> = {
  Images: [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".bmp", ".tif", ".tiff", ".heic", ".svg", ".ico"],
  PDF: [".pdf"],
  Documents: [".doc", ".docx", ".odt", ".rtf", ".txt", ".md"],
  Spreadsheets: [".xls", ".xlsx", ".csv", ".tsv", ".ods"],
  Presentations: [".ppt", ".pptx", ".odp"],
  "Video & audio": [".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v", ".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a"],
  Archives: [".zip", ".7z", ".rar", ".tar", ".gz"],
  Developer: [".json", ".xml", ".html", ".css", ".js", ".ts", ".yaml", ".yml"],
  Other: [],
};

const actions: Record<FileCategory, FileAction[]> = {
  Images: [
    { id: "image-pdf", label: "Convert to PDF", detail: "Put this image into a PDF document.", output: "PDF", toolSlug: "image-to-pdf", kind: "convert" },
    { id: "image-word", label: "Convert to Word", detail: "Use OCR to extract image text into DOCX.", output: "DOCX · OCR", toolSlug: "image-to-word-ocr", kind: "extract" },
    { id: "image-jpg", label: "Convert to JPG", detail: "Create a widely compatible JPG image.", output: "JPG", toolSlug: "png-to-jpg", kind: "convert" },
    { id: "image-png", label: "Convert to PNG", detail: "Export a lossless PNG image.", output: "PNG", toolSlug: "jpg-to-png", kind: "convert" },
    { id: "image-webp", label: "Convert to WEBP", detail: "Create a compact web-ready image.", output: "WEBP", toolSlug: "png-to-webp", kind: "convert" },
    { id: "image-enhance", label: "Enhance image", detail: "Upscale, sharpen and reduce noise.", output: "Enhanced image", toolSlug: "image-enhancer", kind: "ai" },
    { id: "image-compress", label: "Compress image", detail: "Reduce file size and choose quality.", output: "Optimized image", toolSlug: "image-compressor", kind: "edit" },
    { id: "image-resize", label: "Resize image", detail: "Set exact width, height or scale.", output: "Image", toolSlug: "resize-image", kind: "edit" },
  ],
  PDF: [
    { id: "pdf-word", label: "Convert to Word", detail: "Create an editable DOCX document.", output: "DOCX", toolSlug: "pdf-to-word", kind: "convert" },
    { id: "pdf-excel", label: "Convert to Excel", detail: "Extract tables into an XLSX workbook.", output: "XLSX", toolSlug: "pdf-to-excel", kind: "extract" },
    { id: "pdf-ppt", label: "Convert to PowerPoint", detail: "Turn pages into presentation slides.", output: "PPTX", toolSlug: "pdf-to-powerpoint", kind: "convert" },
    { id: "pdf-jpg", label: "Convert to JPG", detail: "Export each page as a JPG image.", output: "JPG", toolSlug: "pdf-to-jpg", kind: "convert" },
    { id: "pdf-png", label: "Convert to PNG", detail: "Export each page as a PNG image.", output: "PNG", toolSlug: "pdf-to-png", kind: "convert" },
    { id: "pdf-compress", label: "Compress PDF", detail: "Reduce size with a quality preset.", output: "PDF", toolSlug: "compress-pdf", kind: "edit" },
    { id: "pdf-merge", label: "Merge PDFs", detail: "Combine this file with other PDFs.", output: "PDF", toolSlug: "merge-pdf", kind: "edit" },
    { id: "pdf-split", label: "Split PDF", detail: "Extract selected pages into new files.", output: "PDF", toolSlug: "split-pdf", kind: "edit" },
    { id: "pdf-ocr", label: "Make searchable (OCR)", detail: "Recognize text in scanned pages.", output: "Searchable PDF", toolSlug: "ocr-extractor", kind: "extract" },
  ],
  Documents: [
    { id: "doc-pdf", label: "Convert to PDF", detail: "Export this document as PDF.", output: "PDF", toolSlug: "word-to-pdf", kind: "convert" },
    { id: "doc-txt", label: "Extract text", detail: "Save the document text as plain TXT.", output: "TXT", toolSlug: "docx-to-txt", kind: "extract" },
    { id: "doc-edit", label: "Edit document", detail: "Open the lightweight document editor.", output: "DOCX", toolSlug: "word-editor", kind: "edit" },
  ],
  Spreadsheets: [
    { id: "sheet-pdf", label: "Convert to PDF", detail: "Export a workbook or CSV to PDF.", output: "PDF", toolSlug: "excel-to-pdf", kind: "convert" },
    { id: "sheet-xlsx", label: "Convert to Excel", detail: "Create an XLSX workbook.", output: "XLSX", toolSlug: "csv-to-xlsx", kind: "convert" },
    { id: "sheet-clean", label: "Clean spreadsheet", detail: "Find duplicate or empty rows.", output: "Cleaned workbook", toolSlug: "remove-duplicates", kind: "edit" },
  ],
  Presentations: [
    { id: "slides-pdf", label: "Convert to PDF", detail: "Export slides as a PDF document.", output: "PDF", toolSlug: "pptx-to-pdf", kind: "convert" },
    { id: "slides-images", label: "Convert to images", detail: "Export slides to PNG images.", output: "PNG", toolSlug: "slides-to-images", kind: "convert" },
  ],
  "Video & audio": [
    { id: "media-mp4", label: "Convert video", detail: "Convert to a widely supported MP4.", output: "MP4", toolSlug: "video-compressor", kind: "convert" },
    { id: "media-gif", label: "Create GIF", detail: "Make a looping clip from video.", output: "GIF", toolSlug: "mp4-to-gif", kind: "convert" },
    { id: "media-audio", label: "Extract audio", detail: "Save the soundtrack as MP3.", output: "MP3", toolSlug: "extract-audio", kind: "extract" },
    { id: "media-audio-convert", label: "Convert audio", detail: "Choose MP3, WAV, AAC or FLAC.", output: "Audio", toolSlug: "audio-converter", kind: "convert" },
  ],
  Archives: [
    { id: "archive-extract", label: "Extract files", detail: "Unpack the archive contents.", output: "Folder", toolSlug: "extract-archive", kind: "extract" },
    { id: "archive-zip", label: "Repack as ZIP", detail: "Create a ZIP archive.", output: "ZIP", toolSlug: "create-zip", kind: "convert" },
  ],
  Developer: [
    { id: "dev-format", label: "Format data", detail: "Beautify and validate structured text.", output: "Formatted text", toolSlug: "json-formatter", kind: "edit" },
    { id: "dev-base64", label: "Encode / decode", detail: "Convert between text and Base64.", output: "Base64", toolSlug: "base64-tools", kind: "convert" },
    { id: "dev-hash", label: "Generate checksum", detail: "Create a digest for this file.", output: "SHA hash", toolSlug: "hash-generator", kind: "extract" },
  ],
  Other: [
    { id: "other-pdf", label: "Try PDF conversion", detail: "Check whether this file can be exported as PDF.", output: "PDF", toolSlug: "word-to-pdf", kind: "convert" },
  ],
};

export function detectFileCategory(file: File): FileCategory {
  const lower = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  for (const category of Object.keys(extensions) as FileCategory[]) {
    if (extensions[category].some((extension) => lower.endsWith(extension))) return category;
  }
  if (mime.startsWith("image/")) return "Images";
  if (mime === "application/pdf") return "PDF";
  if (mime.startsWith("video/") || mime.startsWith("audio/")) return "Video & audio";
  if (mime.includes("spreadsheet") || mime.includes("excel")) return "Spreadsheets";
  if (mime.includes("presentation") || mime.includes("powerpoint")) return "Presentations";
  if (mime.includes("wordprocessing") || mime.includes("msword") || mime.startsWith("text/")) return "Documents";
  if (mime.includes("zip") || mime.includes("compressed")) return "Archives";
  return "Other";
}

export function getActionsForFile(file: File) {
  return actions[detectFileCategory(file)];
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export function acceptedInputForTool(inputLabel: string, category: string) {
  const input = inputLabel.toLowerCase();
  if (input === "pdf") return ".pdf,application/pdf";
  if (input === "png") return ".png,image/png";
  if (input === "jpg") return ".jpg,.jpeg,image/jpeg";
  if (input === "webp") return ".webp,image/webp";
  if (input === "image") return "image/*";
  if (input === "image or pdf") return "image/*,.pdf,application/pdf";
  if (input === "docx") return ".doc,.docx,.odt,.rtf";
  if (input === "csv") return ".csv,.tsv,text/csv";
  if (input === "xlsx" || input === "csv / xlsx") return ".xls,.xlsx,.csv,.tsv,.ods";
  if (input === "pptx") return ".ppt,.pptx,.odp";
  if (input === "video") return "video/*";
  if (input === "audio") return "audio/*";
  if (input === "zip") return ".zip,.7z,.rar,.tar,.gz";
  if (input === "json") return ".json,application/json";
  if (input === "text / url" || input === "text / file" || input === "any file" || input === "files") return "*/*";
  if (category === "Images") return "image/*";
  if (category === "PDF") return ".pdf,application/pdf";
  if (category === "Documents") return ".doc,.docx,.odt,.rtf,.txt,.md";
  if (category === "Spreadsheets") return ".xls,.xlsx,.csv,.tsv,.ods";
  if (category === "Presentations") return ".ppt,.pptx,.odp";
  if (category === "Video & audio") return "video/*,audio/*";
  if (category === "Archives") return ".zip,.7z,.rar,.tar,.gz";
  return "*/*";
}
