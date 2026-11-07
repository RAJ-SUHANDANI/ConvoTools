import type { LucideIcon } from "lucide-react";
import {
  AudioLines, Braces, Check, Code2, FileArchive, FileAudio, FileImage,
  FilePenLine, FileSpreadsheet, FileText, FileVideo, Film, Image as ImageIcon,
  LockKeyhole, Merge, Minimize2, Music2, PanelTop, QrCode, ScanText,
  SlidersHorizontal, Sparkles, Split, WandSparkles
} from "lucide-react";

export type Tool = {
  name: string;
  description: string;
  category: string;
  icon: LucideIcon;
  tag?: string;
  inputLabel?: string;
  outputLabel?: string;
};

export const TOOLS: Tool[] = [
  { name: "PDF to Word", description: "Rebuild selectable PDF text as editable Word paragraphs with approximate position and styling. Embedded images, vector graphics and complex tables are not reconstructed.", category: "PDF", icon: FileText, tag: "Popular", inputLabel: "PDF", outputLabel: "DOCX" },
  { name: "Word to PDF", description: "Render supported DOCX pages, including text, tables and embedded images, into a PDF.", category: "PDF", icon: FilePenLine, inputLabel: "Document", outputLabel: "PDF" },
  { name: "Image to PDF", description: "Combine images into a single PDF document.", category: "PDF", icon: FileImage, tag: "Popular", inputLabel: "Image", outputLabel: "PDF" },
  { name: "Image to Word (OCR)", description: "Keep the source image in a Word document and add OCR-extracted text beneath it for editing and searching.", category: "PDF", icon: ScanText, inputLabel: "Image", outputLabel: "DOCX" },
  { name: "Merge PDF", description: "Bring separate PDF files together in one document.", category: "PDF", icon: Merge, inputLabel: "PDF", outputLabel: "PDF" },
  { name: "Split PDF", description: "Separate selected pages into individual files.", category: "PDF", icon: Split, inputLabel: "PDF", outputLabel: "PDF" },
  { name: "Compress PDF", description: "Rewrite PDF structure with compact object streams; embedded images are not recompressed.", category: "PDF", icon: Minimize2, tag: "Popular", inputLabel: "PDF", outputLabel: "PDF" },
  { name: "Organize PDF", description: "Reorder, rotate, delete or extract PDF pages.", category: "PDF", icon: PanelTop, inputLabel: "PDF", outputLabel: "PDF" },
  { name: "PDF to JPG", description: "Export PDF pages as high-quality JPG images.", category: "PDF", icon: ImageIcon, inputLabel: "PDF", outputLabel: "JPG" },
  { name: "PDF to PNG", description: "Render PDF pages to crisp PNG images.", category: "PDF", icon: ImageIcon, inputLabel: "PDF", outputLabel: "PNG" },
  { name: "PDF to Excel", description: "Rebuild selectable PDF text into editable spreadsheet cells using approximate text positions. Complex tables, formulas and graphics require manual review.", category: "PDF", icon: FileSpreadsheet, inputLabel: "PDF", outputLabel: "XLSX" },
  { name: "PDF to PowerPoint", description: "Rebuild selectable PDF text as editable PowerPoint text boxes with approximate positioning. Images, charts and complex vector artwork are not reconstructed.", category: "PDF", icon: PanelTop, inputLabel: "PDF", outputLabel: "PPTX" },
  { name: "Protect PDF", description: "Add password protection to a PDF file.", category: "PDF", icon: LockKeyhole, inputLabel: "PDF", outputLabel: "PDF" },
  { name: "PNG to JPG", description: "Convert PNG images to compact JPG files.", category: "Images", icon: FileImage, tag: "Popular", inputLabel: "Image", outputLabel: "JPG" },
  { name: "JPG to PNG", description: "Convert JPG images into PNG format.", category: "Images", icon: ImageIcon, inputLabel: "Image", outputLabel: "PNG" },
  { name: "PNG to WEBP", description: "Create lightweight WEBP images from PNG files.", category: "Images", icon: FileImage, inputLabel: "Image", outputLabel: "WEBP" },
  { name: "WEBP converter", description: "Convert WEBP to PNG, JPG or other formats.", category: "Images", icon: FileImage, inputLabel: "Image", outputLabel: "JPG" },
  { name: "Image compressor", description: "Reduce image file sizes while retaining detail.", category: "Images", icon: Minimize2, inputLabel: "Image", outputLabel: "Optimized image" },
  { name: "Resize image", description: "Set exact image dimensions or scale by percentage.", category: "Images", icon: SlidersHorizontal, inputLabel: "Image", outputLabel: "Image" },
  { name: "Crop & rotate", description: "Center-crop an image to a square and rotate it in 90° increments.", category: "Images", icon: ImageIcon, inputLabel: "Image", outputLabel: "Image" },
  { name: "Image enhancer", description: "Coming soon — AI image upscaling is being prepared.", category: "AI lab", icon: WandSparkles, tag: "Coming soon", inputLabel: "Image", outputLabel: "Enhanced image" },
  { name: "Background remover", description: "Coming soon — AI background removal is being prepared.", category: "AI lab", icon: Sparkles, tag: "Coming soon", inputLabel: "Image", outputLabel: "PNG" },
  { name: "Photo restoration", description: "Coming soon — AI photo enhancement is being prepared.", category: "AI lab", icon: ImageIcon, tag: "Coming soon", inputLabel: "Image", outputLabel: "Restored image" },
  { name: "OCR extractor", description: "Coming soon — standalone OCR tools are being prepared.", category: "AI lab", icon: ScanText, tag: "Coming soon", inputLabel: "Image or PDF", outputLabel: "DOCX / TXT" },
  { name: "Word editor", description: "Open and edit DOCX documents in a browser-based Word workspace with text formatting, lists, tables and image insertion. Export an editable DOCX file.", category: "Documents", icon: FilePenLine, inputLabel: "DOCX", outputLabel: "Editable DOCX" },
  { name: "DOCX to TXT", description: "Extract clean plain text from Word documents.", category: "Documents", icon: FileText, inputLabel: "DOCX", outputLabel: "TXT" },
  { name: "Excel to PDF", description: "Export spreadsheet cell content into a simple PDF report; styling may differ.", category: "Spreadsheets", icon: FileSpreadsheet, inputLabel: "XLSX", outputLabel: "PDF" },
  { name: "CSV to XLSX", description: "Turn CSV data into a formatted workbook.", category: "Spreadsheets", icon: FileSpreadsheet, inputLabel: "CSV / XLSX", outputLabel: "XLSX" },
  { name: "Remove duplicates", description: "Find and remove repeated spreadsheet rows.", category: "Spreadsheets", icon: Check, inputLabel: "CSV / XLSX", outputLabel: "Cleaned XLSX" },
  { name: "PPTX to PDF", description: "Render PowerPoint slide content and embedded images into a PDF; complex slide elements may differ.", category: "Presentations", icon: PanelTop, tag: "Popular", inputLabel: "PPTX", outputLabel: "PDF" },
  { name: "PDF to PPTX", description: "Rebuild selectable PDF text as individually editable PowerPoint text boxes. Images, charts and complex graphics are not reconstructed.", category: "Presentations", icon: FileText, inputLabel: "PDF", outputLabel: "PPTX" },
  { name: "Slides to images", description: "Render slide text boxes, basic shapes and embedded images to PNG files.", category: "Presentations", icon: ImageIcon, inputLabel: "PPTX", outputLabel: "PNG" },
  { name: "MP4 to GIF", description: "Turn a video clip into a lightweight looping GIF.", category: "Video & audio", icon: Film, inputLabel: "MP4", outputLabel: "GIF" },
  { name: "Video compressor", description: "Reduce video size for easier sharing.", category: "Video & audio", icon: FileVideo, inputLabel: "Video", outputLabel: "MP4" },
  { name: "Extract audio", description: "Save the audio track from a video file.", category: "Video & audio", icon: FileAudio, inputLabel: "Video", outputLabel: "MP3" },
  { name: "Audio converter", description: "Convert between MP3, WAV, AAC and FLAC.", category: "Video & audio", icon: Music2, inputLabel: "Audio", outputLabel: "MP3" },
  { name: "Create ZIP", description: "Bundle multiple files into one ZIP archive.", category: "Archives", icon: FileArchive, inputLabel: "Files", outputLabel: "ZIP" },
  { name: "Extract archive", description: "Extract ZIP archive contents into individual downloadable files.", category: "Archives", icon: FileArchive, inputLabel: "ZIP", outputLabel: "Files" },
  { name: "JSON formatter", description: "Format and validate JSON with a searchable tree viewer and code editor. Convert JSON to XML, CSV, formatted or minified JSON.", category: "Developer", icon: Braces, inputLabel: "JSON or text", outputLabel: "JSON · XML · CSV" },
  { name: "Base64 tools", description: "Encode and decode text or files.", category: "Developer", icon: Code2, inputLabel: "Text / File", outputLabel: "Base64" },
  { name: "Hash generator", description: "Create file checksums locally.", category: "Developer", icon: LockKeyhole, inputLabel: "Any file", outputLabel: "Hash" },
  { name: "QR generator", description: "Create QR codes from links and text.", category: "Developer", icon: QrCode, inputLabel: "Text / URL", outputLabel: "PNG / SVG" },
];

export const TOOL_CATEGORIES = [
  { name: "All tools", detail: "The complete toolbox" },
  { name: "PDF", detail: "Convert, organize and protect" },
  { name: "Images", detail: "Convert, resize and refine" },
  { name: "Documents", detail: "Edit, export and extract" },
  { name: "Spreadsheets", detail: "Clean, reshape and share" },
  { name: "Presentations", detail: "Slides in every format" },
  { name: "Video & audio", detail: "Trim, convert and compress" },
  { name: "AI lab", detail: "Coming soon — access is temporarily locked" },
  { name: "Archives", detail: "Pack and unpack" },
  { name: "Developer", detail: "Utilities for file workflows" },
];

export function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getToolBySlug(slug: string) {
  return TOOLS.find((tool) => slugify(tool.name) === slug);
}
