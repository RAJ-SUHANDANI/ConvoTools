import Link from "next/link";
import { ArrowUpRight, Check, FileText, LockKeyhole } from "lucide-react";
import type { Tool } from "@/lib/tools";
import { TOOLS, slugify } from "@/lib/tools";

const SITE = "https://convotool.vercel.app";

function answerFor(tool: Tool) {
  const n = tool.name.toLowerCase();
  const input = tool.inputLabel || "your file";
  const output = tool.outputLabel || "the requested format";
  if (tool.name === "PDF to Word") return "Convert a PDF into an editable DOCX Word document by extracting its selectable text in your browser. Upload a PDF, run the conversion and download the resulting Word file. The current converter extracts text and does not preserve the original page layout.";
  if (tool.name === "Image to PDF") return "Combine one or more images into a single PDF document. Select your image files, convert them together and download one PDF containing the images in selection order.";
  if (tool.name === "Word to PDF") return "Turn a supported Word document into a paginated PDF. ConvoTools extracts the document text and creates a clean PDF; complex original formatting and page layout may differ.";
  if (tool.name === "PDF to Excel") return "Extract selectable text from a PDF into spreadsheet rows and download an XLSX workbook. Complex tables may need manual cleanup after conversion.";
  if (tool.name === "PDF to PowerPoint" || tool.name === "PDF to PPTX") return "Convert PDF pages into a PowerPoint presentation file. The conversion creates slide content from the PDF; check the resulting slide layout and editability before presenting.";
  if (tool.name === "PDF to JPG" || tool.name === "PDF to PNG") return "Render PDF pages as individual image files. Upload a PDF and export its pages as "+(tool.name.endsWith("JPG")?"JPG":"PNG")+" images for sharing, previewing or reuse.";
  if (tool.name === "PPTX to PDF") return "Convert a PowerPoint presentation into a PDF document. ConvoTools extracts slide text into a simple PDF, so the original slide design and layout are not retained.";
  if (tool.name === "Excel to PDF") return "Export spreadsheet cell content from an XLSX workbook into a simple PDF report. Review the PDF after conversion because spreadsheet styling and layout may differ.";
  if (tool.name === "Compress PDF") return "Reduce a PDF's file size by rewriting its internal structure. This mode does not recompress embedded images, so image-heavy PDFs may see limited size reduction.";
  if (tool.name === "Image to Word (OCR)") return "Extract text visible in an image and prepare it as an editable Word document using optical character recognition. Review the output for recognition errors, especially in low-quality scans.";
  if (tool.name === "DOCX to TXT") return "Extract the text from a DOCX Word document and save it as a plain TXT file without Word page styling.";
  if (tool.name === "PNG to JPG") return "Convert PNG images into JPG files. JPG is useful when you need a widely supported image format and a smaller file; transparent areas are filled with white.";
  if (tool.name === "JPG to PNG") return "Convert JPG images into PNG format. PNG supports lossless image storage and transparency in future edits, but converting a JPG cannot restore detail already lost to compression.";
  if (tool.name === "PNG to WEBP") return "Convert PNG images into WEBP format for modern web delivery. Compare the exported image and file size before replacing your original asset.";
  if (tool.name === "WEBP converter") return "Convert a WEBP image to JPG, PNG or another available image format. Choose the output format in the tool, then process and download the converted image.";
  if (tool.name === "Image compressor") return "Create a smaller image file using a quality preset. Choose a smaller, balanced or best-quality setting and compare the result with the original before publishing.";
  if (tool.name === "Resize image") return "Resize an image to specific pixel dimensions while maintaining its aspect ratio when only one dimension is supplied. Enter a width, height or both, then export the resized image.";
  if (tool.name === "Crop & rotate") return "Crop an image to its original framing or a centered square and rotate it in 90-degree increments. Export the edited image when the preview settings are ready.";
  if (tool.name === "Merge PDF") return "Combine multiple PDF files into one PDF in the order you select them. Add the source PDFs together and download a merged document.";
  if (tool.name === "Split PDF") return "Separate selected PDF pages into individual PDF files packaged in a ZIP archive. Enter page numbers such as 1, 3, 5, or leave the field blank to export every page.";
  if (tool.name === "Organize PDF") return "Reorder, rotate, remove or extract PDF pages by entering the page sequence you want. Check the page numbering carefully before exporting.";
  if (tool.name === "Protect PDF") return "Add password protection to a PDF using a password you choose. Keep the password somewhere safe because it cannot be recovered by ConvoTools.";
  if (tool.name === "CSV to XLSX") return "Convert a CSV data file into an Excel XLSX workbook that you can open and continue editing in spreadsheet software.";
  if (tool.name === "Remove duplicates") return "Find repeated spreadsheet rows and export a cleaned workbook. Inspect the output to confirm that the chosen rows were the duplicates you intended to remove.";
  if (tool.name === "MP4 to GIF") return "Convert an MP4 video clip into an animated GIF. Short clips generally make more manageable GIFs; output size depends on clip length and visual complexity.";
  if (tool.name === "Video compressor") return "Re-encode a video with a selected quality preset to reduce its file size. The balance between size and visual quality depends on the source video.";
  if (tool.name === "Extract audio") return "Extract the audio track from a supported video and save it as an audio file. The result contains the source soundtrack rather than the video picture.";
  if (tool.name === "Audio converter") return "Convert supported audio files between formats such as MP3, WAV, AAC, FLAC and OGG. Choose an available output format and download the converted audio.";
  if (tool.name === "Create ZIP") return "Bundle multiple selected files into one ZIP archive for easier storage and sharing. Select the files you want to include and create the archive.";
  if (tool.name === "Extract archive") return "Extract the files inside a ZIP archive and download the extracted contents. Choose a supported ZIP file to begin.";
  if (tool.name === "JSON formatter") return "Format and validate a JSON file so its structure is easier to read and inspect. Invalid JSON is reported instead of being silently rewritten.";
  if (tool.name === "Base64 tools") return "Encode files as Base64 text or decode Base64 content back into a file. Choose encode or decode mode and select the expected decoded file type when decoding.";
  if (tool.name === "Hash generator") return "Generate a SHA-256, SHA-384 or SHA-512 checksum for a file. A checksum can help compare file integrity; matching hashes do not prove who created a file.";
  if (tool.name === "QR generator") return "Create a QR code from text or a URL and export it as PNG or SVG. Scan the exported code with a phone to verify that it contains the intended destination.";
  if (tool.name === "Word editor") return "Open a DOCX document, edit its extracted text and export a clean DOCX file. This text-focused editor does not promise to preserve the original document layout.";
  return "Use this online "+tool.name.toLowerCase()+" tool to work with "+input+" and create "+output+". Add a compatible file, review the available settings, then process and download the result.";
}

function faqFor(tool: Tool) {
  const input = tool.inputLabel || "the listed input format";
  const output = tool.outputLabel || "the listed output format";
  const specific = tool.name === "PDF to Word"
    ? "No. The current converter extracts selectable text into DOCX; it does not retain the original PDF page layout."
    : tool.name === "Word to PDF" || tool.name === "PPTX to PDF" || tool.name === "Excel to PDF"
      ? "Not necessarily. This converter focuses on extracting content into a simple PDF, and the original styling or layout may differ."
      : tool.name === "Compress PDF"
        ? "Not always. This tool rewrites PDF structure but does not recompress embedded images, so image-heavy files may not become much smaller."
        : "Output fidelity depends on the source file, its contents and the conversion format. Review the downloaded result before relying on it.";
  return [
    { q: "How do I use the "+tool.name.toLowerCase()+" tool?", a: "Choose a compatible "+input+" file, adjust any available settings and select Process & download. When processing finishes, the output is downloaded and remains available in the result list." },
    { q: "Which file formats does this tool support?", a: "The listed input is "+input+" and the intended output is "+output+". Check the file type shown in the upload panel before processing." },
    { q: "Will the converted file keep the original formatting?", a: specific },
    { q: "Are my files uploaded to a server?", a: "This tool runs its processing in your browser. Your selected file is handled by the browser-side conversion workflow; keep your browser open until processing and download finish." },
  ];
}

export default function ToolLandingContent({ tool }: { tool: Tool }) {
  const answer = answerFor(tool);
  const faqs = faqFor(tool);
  const related = TOOLS.filter((candidate) => candidate.name !== tool.name && candidate.category === tool.category && candidate.category !== "AI lab").slice(0, 4);
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.name + " Online",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any device with a modern web browser",
      url: SITE + "/tools/" + slugify(tool.name),
      description: answer,
      inLanguage: "en-IN",
      provider: { "@type": "Organization", name: "ConvoTools", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Tools", item: SITE + "/#toolkit" },
        { "@type": "ListItem", position: 3, name: tool.name, item: SITE + "/tools/" + slugify(tool.name) },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <section className="tool-seo-content" aria-label={tool.name + " guide"}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="tool-seo-inner">
        <div className="tool-seo-answer">
          <span className="tool-seo-eyebrow">THE QUICK ANSWER</span>
          <h2>What does {tool.name.toLowerCase()} do?</h2>
          <p>{answer}</p>
          <div className="tool-seo-facts">
            <span><Check size={15} /> Input: {tool.inputLabel || "See accepted formats above"}</span>
            <span><FileText size={15} /> Output: {tool.outputLabel || "See output options above"}</span>
            <span><LockKeyhole size={15} /> Browser-based processing</span>
          </div>
        </div>
        <div className="tool-seo-how">
          <span className="tool-seo-eyebrow">HOW IT WORKS</span>
          <h2>How to use {tool.name.toLowerCase()}</h2>
          <ol>
            <li><b>01</b><span><strong>Add your file</strong><small>Select a compatible {tool.inputLabel || "file"} from your device.</small></span></li>
            <li><b>02</b><span><strong>Choose the settings</strong><small>Review the output format and any options available for this tool.</small></span></li>
            <li><b>03</b><span><strong>Process and download</strong><small>Start the conversion, then save the generated file to your device.</small></span></li>
          </ol>
        </div>
        <div className="tool-seo-faq">
          <span className="tool-seo-eyebrow">HELP & ANSWERS</span>
          <h2>{tool.name} — frequently asked questions</h2>
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}<span>+</span></summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        {related.length > 0 && (
          <nav className="tool-seo-related" aria-label="Related tools">
            <span className="tool-seo-eyebrow">KEEP WORKING</span>
            <h2>Related {tool.category.toLowerCase()} tools</h2>
            <div>{related.map((item) => (
              <Link key={item.name} href={"/tools/" + slugify(item.name)}>
                {item.name}<ArrowUpRight size={14} />
              </Link>
            ))}</div>
          </nav>
        )}
        <p className="tool-seo-note">ConvoTools publishes tool-specific format requirements and conversion limitations so people and answer engines can understand what this tool does. Always check the downloaded result before using it in a production workflow.</p>
      </div>
    </section>
  );
}
