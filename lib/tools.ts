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
  { name: "PDF to Word", description: "Convert a PDF into an editable Word document.", category: "PDF", icon: FileText, tag: "Popular", inputLabel: "PDF", outputLabel: "DOCX" },
  { name: "Word to PDF", description: "Turn Word documents into easy-to-share PDFs.", category: "PDF", icon: FilePenLine, inputLabel: "Document", outputLabel: "PDF" },
  { name: "Image to PDF", description: "Combine images into a single PDF document.", category: "PDF", icon: FileImage, tag: "Popular", inputLabel: "Image", outputLabel: "PDF" },
  { name: "Image to Word (OCR)", description: "Extract text from an image into an editable document.", category: "PDF", icon: ScanText, inputLabel: "Image", outputLabel: "DOCX" },
  { name: "Merge PDF", description: "Bring separate PDF files together in one document.", category: "PDF", icon: Merge, inputLabel: "PDF", outputLabel: "PDF" },
  { name: "Split PDF", description: "Separate selected pages into individual files.", category: "PDF", icon: Split, inputLabel: "PDF", outputLabel: "PDF" },
  { name: "Compress PDF", description: "Reduce PDF size while balancing visual quality.", category: "PDF", icon: Minimize2, tag: "Popular", inputLabel: "PDF", outputLabel: "PDF" },
  { name: "Organize PDF", description: "Reorder, rotate, delete or extract PDF pages.", category: "PDF", icon: PanelTop, inputLabel: "PDF", outputLabel: "PDF" },
  { name: "PDF to JPG", description: "Export PDF pages as high-quality JPG images.", category: "PDF", icon: ImageIcon, inputLabel: "PDF", outputLabel: "JPG" },
  { name: "PDF to PNG", description: "Render PDF pages to crisp PNG images.", category: "PDF", icon: ImageIcon, inputLabel: "PDF", outputLabel: "PNG" },
  { name: "PDF to Excel", description: "Extract PDF tables into an Excel workbook.", category: "PDF", icon: FileSpreadsheet, inputLabel: "PDF", outputLabel: "XLSX" },
  { name: "PDF to PowerPoint", description: "Turn PDF pages into presentation slides.", category: "PDF", icon: PanelTop, inputLabel: "PDF", outputLabel: "PPTX" },
  { name: "Protect PDF", description: "Add password protection to a PDF file.", category: "PDF", icon: LockKeyhole, inputLabel: "PDF", outputLabel: "PDF" },
  { name: "PNG to JPG", description: "Convert PNG images to compact JPG files.", category: "Images", icon: FileImage, tag: "Popular", inputLabel: "Image", outputLabel: "JPG" },
  { name: "JPG to PNG", description: "Convert JPG images into PNG format.", category: "Images", icon: ImageIcon, inputLabel: "Image", outputLabel: "PNG" },
  { name: "PNG to WEBP", description: "Create lightweight WEBP images from PNG files.", category: "Images", icon: FileImage, inputLabel: "Image", outputLabel: "WEBP" },
  { name: "WEBP converter", description: "Convert WEBP to PNG, JPG or other formats.", category: "Images", icon: FileImage, inputLabel: "Image", outputLabel: "JPG" },
  { name: "Image compressor", description: "Reduce image file sizes while retaining detail.", category: "Images", icon: Minimize2, inputLabel: "Image", outputLabel: "Optimized image" },
  { name: "Resize image", description: "Set exact image dimensions or scale by percentage.", category: "Images", icon: SlidersHorizontal, inputLabel: "Image", outputLabel: "Image" },
  { name: "Crop & rotate", description: "Crop, straighten, rotate and flip an image.", category: "Images", icon: ImageIcon, inputLabel: "Image", outputLabel: "Image" },
  { name: "Image enhancer", description: "Upscale, sharpen and reduce noise in images.", category: "AI lab", icon: WandSparkles, tag: "AI", inputLabel: "Image", outputLabel: "Enhanced image" },
  { name: "Background remover", description: "Separate a subject and export a transparent image.", category: "AI lab", icon: Sparkles, tag: "AI", inputLabel: "Image", outputLabel: "PNG" },
  { name: "Photo restoration", description: "Improve faded, scratched or damaged photographs.", category: "AI lab", icon: ImageIcon, tag: "AI", inputLabel: "Image", outputLabel: "Restored image" },
  { name: "OCR extractor", description: "Turn scanned pages and screenshots into editable text.", category: "AI lab", icon: ScanText, tag: "AI", inputLabel: "Image or PDF", outputLabel: "DOCX / TXT" },
  { name: "Word editor", description: "Make quick edits to text and document structure.", category: "Documents", icon: FilePenLine, inputLabel: "DOCX", outputLabel: "DOCX" },
  { name: "DOCX to TXT", description: "Extract clean plain text from Word documents.", category: "Documents", icon: FileText, inputLabel: "DOCX", outputLabel: "TXT" },
  { name: "Excel to PDF", description: "Export spreadsheets into shareable PDF pages.", category: "Spreadsheets", icon: FileSpreadsheet, inputLabel: "XLSX", outputLabel: "PDF" },
  { name: "CSV to XLSX", description: "Turn CSV data into a formatted workbook.", category: "Spreadsheets", icon: FileSpreadsheet, inputLabel: "CSV / XLSX", outputLabel: "XLSX" },
  { name: "Remove duplicates", description: "Find and remove repeated spreadsheet rows.", category: "Spreadsheets", icon: Check, inputLabel: "CSV / XLSX", outputLabel: "Cleaned XLSX" },
  { name: "PPTX to PDF", description: "Export presentations as reliable PDF documents.", category: "Presentations", icon: PanelTop, tag: "Popular", inputLabel: "PPTX", outputLabel: "PDF" },
  { name: "PDF to PPTX", description: "Convert PDF pages into editable slide layouts.", category: "Presentations", icon: FileText, inputLabel: "PDF", outputLabel: "PPTX" },
  { name: "Slides to images", description: "Export every presentation slide as an image.", category: "Presentations", icon: ImageIcon, inputLabel: "PPTX", outputLabel: "PNG" },
  { name: "MP4 to GIF", description: "Turn a video clip into a lightweight looping GIF.", category: "Video & audio", icon: Film, inputLabel: "MP4", outputLabel: "GIF" },
  { name: "Video compressor", description: "Reduce video size for easier sharing.", category: "Video & audio", icon: FileVideo, inputLabel: "Video", outputLabel: "MP4" },
  { name: "Extract audio", description: "Save the audio track from a video file.", category: "Video & audio", icon: FileAudio, inputLabel: "Video", outputLabel: "MP3" },
  { name: "Audio converter", description: "Convert between MP3, WAV, AAC and FLAC.", category: "Video & audio", icon: Music2, inputLabel: "Audio", outputLabel: "MP3" },
  { name: "Create ZIP", description: "Bundle multiple files into one ZIP archive.", category: "Archives", icon: FileArchive, inputLabel: "Files", outputLabel: "ZIP" },
  { name: "Extract archive", description: "Unpack ZIP and other supported archive files.", category: "Archives", icon: FileArchive, inputLabel: "ZIP", outputLabel: "Files" },
  { name: "JSON formatter", description: "Format and validate JSON data.", category: "Developer", icon: Braces, inputLabel: "JSON", outputLabel: "JSON" },
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
  { name: "AI lab", detail: "Enhance with intelligence" },
  { name: "Archives", detail: "Pack and unpack" },
  { name: "Developer", detail: "Utilities for file workflows" },
];

export function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getToolBySlug(slug: string) {
  return TOOLS.find((tool) => slugify(tool.name) === slug);
}
