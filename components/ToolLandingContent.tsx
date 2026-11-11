import Link from "next/link";
import { ArrowUpRight, BookOpenText, Check, FileText, Github, LockKeyhole, ShieldCheck } from "lucide-react";
import { Fade } from "@animate-ui/react/primitives/effects/fade";
import { ArrowRight as AnimatedArrowRight } from "@/components/animate-ui/icons/arrow-right";
import type { Tool } from "@/lib/tools";
import { TOOLS, slugify } from "@/lib/tools";

const SITE = "https://convotool.vercel.app";

export function answerFor(tool: Tool) {
  const input = tool.inputLabel || "your file";
  const output = tool.outputLabel || "the requested format";
  if (tool.name === "PDF to Word") return "Convert a PDF into an editable Word document in your browser. The reconstruction engine rebuilds text, paragraphs, embedded images, detected tables and many vector drawings as Word objects. Complex multi-column layouts, unusual fonts, clipping effects and some graphics may need manual adjustment. Scanned PDFs require OCR.";
  if (tool.name === "Image to PDF") return "Combine one or more images into a single PDF document. Select your image files, convert them together and download one PDF containing the images in selection order.";
  if (tool.name === "Word to PDF") return "Render a supported DOCX Word document as a paginated PDF, including text, tables and embedded images. The output preserves the rendered page appearance; PDF content is page imagery rather than individually editable objects.";
  if (tool.name === "PDF to Excel") return "Extract detected PDF tables into editable Excel worksheets, with rows and columns reconstructed as cells. Remaining selectable text is placed in separate page worksheets. Merged cells, formulas, charts and semantic relationships are not inferred automatically; review the workbook.";
  if (tool.name === "PDF to PowerPoint" || tool.name === "PDF to PPTX") return "Rebuild PDF text as separate editable PowerPoint text boxes, detected tables as native slide tables, embedded images as picture objects and supported vector paths as editable shapes. Advanced clipping, gradients, chart data and complex effects may need adjustment. Scanned PDFs require OCR.";
  if (tool.name === "PDF to JPG" || tool.name === "PDF to PNG") return "Render PDF pages as individual image files. Upload a PDF and export its pages as "+(tool.name.endsWith("JPG")?"JPG":"PNG")+" images for sharing, previewing or reuse.";
  if (tool.name === "PPTX to PDF") return "Convert a PowerPoint presentation into a PDF by rendering slide text, supported shapes and embedded images. Complex animations, charts, themes and some advanced slide elements may differ from the original.";
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
  if (tool.name === "JSON formatter") return "Format and validate JSON in a live code editor while exploring the parsed data in a collapsible, searchable tree. Open JSON files, pretty-print or minify them, and export JSON as XML or CSV without sending the data to a server.";
  if (tool.name === "Base64 tools") return "Encode files as Base64 text or decode Base64 content back into a file. Choose encode or decode mode and select the expected decoded file type when decoding.";
  if (tool.name === "Hash generator") return "Generate a SHA-256, SHA-384 or SHA-512 checksum for a file. A checksum can help compare file integrity; matching hashes do not prove who created a file.";
  if (tool.name === "QR generator") return "Create a QR code from text or a URL and export it as PNG or SVG. Scan the exported code with a phone to verify that it contains the intended destination.";
  if (tool.name === "Word editor") return "Open a DOCX document in a browser-based Word workspace. Edit text directly on the page, apply headings, bold, italic, underline and alignment, create lists, insert images, edit tables and export a new DOCX file. Advanced Word features such as tracked changes, macros, SmartArt and complex page layouts may need adjustment.";
  return "Use this online "+tool.name.toLowerCase()+" tool to work with "+input+" and create "+output+". Add a compatible file, review the available settings, then process and download the result.";
}

function faqFor(tool: Tool) {
  const input = tool.inputLabel || "the listed input format";
  const output = tool.outputLabel || "the listed output format";
  const specific = tool.name === "Word editor"
    ? "Yes. Open a DOCX, click in the page and edit the content with the formatting toolbar. Export creates a new editable DOCX; advanced Word features and complex layouts may need review."
    : tool.name === "JSON formatter"
      ? "Yes. It validates JSON as you type, shows a collapsible tree, lets you search keys and values, and exports formatted JSON, minified JSON, XML or CSV."
      : tool.name === "PDF to Word"
        ? "Selectable text, images, tables and supported vector drawings are reconstructed as Word objects. Complex layouts and some graphics may need manual adjustment."
        : tool.name === "Word to PDF" || tool.name === "PPTX to PDF" || tool.name === "Excel to PDF"
          ? "Output fidelity depends on the source file, its contents and browser rendering support. Review the downloaded PDF before sharing."
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
      isAccessibleForFree: true,
      about: tool.category + " file processing",
      mainEntityOfPage: SITE + "/tools/" + slugify(tool.name),
      provider: { "@type": "Organization", name: "ConvoTools", url: SITE },
      softwareHelp: { "@type": "CreativeWork", url: SITE + "/privacy", name: "Privacy and file handling" },
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
      "@type": "HowTo",
      name: "How to use " + tool.name + " in ConvoTools",
      description: "Step-by-step instructions for the ConvoTools " + tool.name + " browser tool.",
      url: SITE + "/tools/" + slugify(tool.name),
      step: [
        { "@type": "HowToStep", position: 1, name: "Add your file", text: "Choose a compatible " + (tool.inputLabel || "file") + " from your device." },
        { "@type": "HowToStep", position: 2, name: "Review the settings", text: "Select the available output format and any settings for " + tool.name + "." },
        { "@type": "HowToStep", position: 3, name: "Process and download", text: "Run the operation and review the result downloaded by your browser." }
      ]
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
        {tool.name === "PDF to Word" && (
          <p className="tool-seo-license">
            PDF-to-DOCX conversion uses a browser-based open-source engine under AGPL-3.0.
            <a href="/licenses/AGPL-3.0-PDF2DOCX-WASM.txt" target="_blank" rel="noreferrer">View license</a>
            <a href="https://github.com/jsscheller/pdf2docx-wasm" target="_blank" rel="noreferrer">View corresponding source</a>
          </p>
        )}
        <Fade inView asChild>
          <aside className="tool-trust-guide" aria-labelledby="tool-trust-title">
            <div className="tool-trust-intro">
              <span className="tool-trust-overline"><ShieldCheck size={15} /> BUILT WITH CLARITY / 001</span>
              <div className="tool-trust-symbol" aria-hidden="true">
                <ShieldCheck size={40} strokeWidth={1.4} />
                <span className="tool-trust-symbol-spark">✳</span>
              </div>
              <h2 id="tool-trust-title">Your files.<br /><em>Your call.</em></h2>
              <p>Supported tools process files in your browser, with no account required. Conversion accuracy depends on the format and source file—check your result before sharing it.</p>
              <div className="tool-trust-signals" aria-label="Tool privacy highlights">
                <span><Check size={13} /> Browser-first</span>
                <span><Check size={13} /> No sign-in</span>
                <span><Check size={13} /> Clear limitations</span>
              </div>
            </div>
            <nav className="tool-trust-nav" aria-label="Source and privacy references">
              <span className="tool-trust-nav-label">EXPLORE THE DETAILS</span>
              <Link className="tool-trust-destination" href="/privacy">
                <span className="tool-trust-destination-icon"><LockKeyhole size={22} /></span>
                <span className="tool-trust-destination-copy"><strong>Privacy, without the guesswork</strong><small>How local processing and browser storage work.</small></span>
                <AnimatedArrowRight className="tool-trust-arrow" size={21} animateOnHover />
              </Link>
              <a className="tool-trust-destination" href="https://github.com/RAJ-SUHANDANI/ConvoTools" target="_blank" rel="noopener noreferrer">
                <span className="tool-trust-destination-icon"><Github size={22} /></span>
                <span className="tool-trust-destination-copy"><strong>See the actual source</strong><small>Inspect the project and its implementation.</small></span>
                <AnimatedArrowRight className="tool-trust-arrow" size={21} animateOnHover />
              </a>
              <Link className="tool-trust-destination" href="/about">
                <span className="tool-trust-destination-icon"><BookOpenText size={22} /></span>
                <span className="tool-trust-destination-copy"><strong>The thinking behind ConvoTools</strong><small>What we build, how it works, and why.</small></span>
                <AnimatedArrowRight className="tool-trust-arrow" size={21} animateOnHover />
              </Link>
              <span className="tool-trust-fineprint">No marketing promises in place of technical details.</span>
            </nav>
          </aside>
        </Fade>
        <p className="tool-seo-note">Conversion capabilities and limitations may differ by file content or browser. Inspect the downloaded result before publishing or sending it to someone else.</p>
      </div>
    </section>
  );
}
