"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  AlignCenter, AlignLeft, AlignRight, Bold, FilePlus2, ImagePlus, Italic, List, ListOrdered,
  LoaderCircle, Redo2, Save, Table2, Underline, Undo2, Upload
} from "lucide-react";
import { Document, ImageRun, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, HeadingLevel, AlignmentType } from "docx";
import { clearPendingFiles, getPendingFiles } from "@/lib/file-session";

type InlineRun = TextRun | ImageRun;

const INITIAL_HTML = "<h1>Untitled document</h1><p>Start writing your document here. Select text to format it with the toolbar.</p>";

function normalizedColor(value: string): string | undefined {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) return hex[1].length === 3 ? hex[1].split("").map(part => part + part).join("").toUpperCase() : hex[1].toUpperCase();
  const rgb = value.match(/^rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)/i);
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map(part => Math.max(0, Math.min(255, Number(part))).toString(16).padStart(2, "0")).join("").toUpperCase();
  return undefined;
}

function docxFontSize(element: HTMLElement, inherited?: number): number | undefined {
  const cssSize = element.style.fontSize;
  if (cssSize) {
    const number = Number.parseFloat(cssSize);
    if (Number.isFinite(number) && number > 0) {
      if (cssSize.endsWith("pt")) return Math.round(number * 2);
      if (cssSize.endsWith("px")) return Math.round(number * 1.5);
    }
  }
  if (element.tagName === "FONT") {
    const legacySize = Number((element as HTMLFontElement).size);
    const halfPoints: Record<number, number> = { 1: 16, 2: 18, 3: 24, 4: 28, 5: 36, 6: 48, 7: 72 };
    return halfPoints[legacySize] || inherited;
  }
  return inherited;
}

function decodeDataUrl(value: string): Uint8Array {
  const base64 = value.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function imageDimensions(element: HTMLImageElement) {
  const width = Math.max(1, Math.min(600, element.width || element.naturalWidth || 320));
  const height = Math.max(1, Math.min(780, element.height || element.naturalHeight || 220));
  const scale = Math.min(1, 600 / width, 780 / height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

async function inlineChildren(node: Node, state: { bold?: boolean; italic?: boolean; underline?: boolean; size?: number; color?: string; font?: string }): Promise<InlineRun[]> {
  const runs: InlineRun[] = [];
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || "";
      if (text) runs.push(new TextRun({ text, bold: state.bold, italics: state.italic, underline: state.underline ? {} : undefined, size: state.size, color: state.color, font: state.font }));
      continue;
    }
    if (!(child instanceof HTMLElement)) continue;
    const styleColor = normalizedColor(child.style.color);
    const family = child.style.fontFamily.split(",")[0]?.trim().replace(/^["']|["']$/g, "");
    const next = {
      bold: state.bold || child.tagName === "B" || child.tagName === "STRONG" || Number.parseInt(child.style.fontWeight, 10) >= 600,
      italic: state.italic || child.tagName === "I" || child.tagName === "EM" || child.style.fontStyle === "italic",
      underline: state.underline || child.tagName === "U" || child.style.textDecoration.includes("underline"),
      size: docxFontSize(child, state.size),
      color: styleColor || state.color,
      font: family || state.font,
    };
    if (child.tagName === "BR") {
      runs.push(new TextRun({ text: "", break: 1 }));
    } else if (child.tagName === "IMG") {
      const src = (child as HTMLImageElement).src;
      if (src.startsWith("data:")) {
        const dimensions = imageDimensions(child as HTMLImageElement);
        const mime = src.slice(5, src.indexOf(";")).toLowerCase();
        let imageType: "png" | "jpg" | "gif" | "bmp" = mime.includes("jpeg") ? "jpg" : mime.endsWith("/gif") ? "gif" : mime.endsWith("/bmp") ? "bmp" : "png";
        let decoded = decodeDataUrl(src);
        if (!["image/png", "image/jpeg", "image/gif", "image/bmp"].includes(mime)) {
          const sourceBlob = await (await fetch(src)).blob();
          const bitmap = await createImageBitmap(sourceBlob);
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Could not prepare an embedded image for Word.");
          context.drawImage(bitmap, 0, 0);
          bitmap.close();
          const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Could not convert an embedded image to PNG.")), "image/png"));
          decoded = new Uint8Array(await png.arrayBuffer());
          imageType = "png";
          canvas.width = 0;
          canvas.height = 0;
        }
        const safeBytes = new Uint8Array(new ArrayBuffer(decoded.byteLength));
        safeBytes.set(decoded);
        runs.push(new ImageRun({ data: safeBytes, type: imageType, transformation: dimensions }));
      } else {
        runs.push(new TextRun({ text: "[External image omitted: embed an image file to include it in DOCX]" }));
      }
    } else {
      runs.push(...await inlineChildren(child, next));
      if (["SPAN", "A"].includes(child.tagName) && child.textContent) {
        // Inline wrappers do not create paragraphs; their text remains editable.
      }
    }
  }
  return runs;
}

async function htmlToDocx(html: string): Promise<Blob> {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const body = parsed.body;
  const blocks: (Paragraph | Table)[] = [];
  const addParagraph = async (element: HTMLElement, heading?: typeof HeadingLevel[keyof typeof HeadingLevel]) => {
    const runs = await inlineChildren(element, {});
    const align = element.style.textAlign === "center" ? AlignmentType.CENTER
      : element.style.textAlign === "right" ? AlignmentType.RIGHT
      : element.style.textAlign === "justify" ? AlignmentType.JUSTIFIED : AlignmentType.LEFT;
    blocks.push(new Paragraph({
      children: runs.length ? runs : [new TextRun("")],
      heading,
      alignment: align,
      spacing: { after: 120, line: 276 },
    }));
  };

  for (const node of Array.from(body.children)) {
    if (node.tagName === "TABLE") {
      const rows = Array.from(node.querySelectorAll(":scope > tbody > tr, :scope > tr"));
      const tableRows: TableRow[] = [];
      for (const row of rows) {
        const cells: TableCell[] = [];
        for (const cell of Array.from(row.children)) {
          if (!["TD", "TH"].includes(cell.tagName)) continue;
          const runs = await inlineChildren(cell, {});
          cells.push(new TableCell({
            children: [new Paragraph({ children: runs.length ? runs : [new TextRun("")] })],
            width: { size: 100 / Math.max(1, row.children.length), type: WidthType.PERCENTAGE },
          }));
        }
        if (cells.length) tableRows.push(new TableRow({ children: cells }));
      }
      if (tableRows.length) blocks.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      continue;
    }
    if (node.tagName === "UL" || node.tagName === "OL") {
      for (const item of Array.from(node.children)) {
        if (item.tagName !== "LI") continue;
        const runs = await inlineChildren(item, {});
        const prefix = node.tagName === "UL" ? "• " : (Array.from(node.children).indexOf(item) + 1) + ". ";
        blocks.push(new Paragraph({ children: [new TextRun({ text: prefix }), ...runs], indent: { left: 360 }, spacing: { after: 90 } }));
      }
      continue;
    }
    if (node.tagName === "H1") await addParagraph(node as HTMLElement, HeadingLevel.HEADING_1);
    else if (node.tagName === "H2") await addParagraph(node as HTMLElement, HeadingLevel.HEADING_2);
    else if (node.tagName === "H3") await addParagraph(node as HTMLElement, HeadingLevel.HEADING_3);
    else if (["P", "DIV", "BLOCKQUOTE", "PRE"].includes(node.tagName) || node.querySelector("img")) await addParagraph(node as HTMLElement);
    else await addParagraph(node as HTMLElement);
  }

  const document = new Document({
    creator: "ConvoTools",
    title: "Document edited with ConvoTools",
    sections: [{ properties: {}, children: blocks.length ? blocks : [new Paragraph("")] }],
  });
  return Packer.toBlob(document);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export default function WordEditorWorkspace() {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState("Untitled document.docx");
  const [status, setStatus] = useState("Your document stays in this browser.");
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [fontSize, setFontSize] = useState("3");

  useEffect(() => {
    if (editorRef.current && !editorRef.current.dataset.initialized) {
      editorRef.current.innerHTML = INITIAL_HTML;
      editorRef.current.dataset.initialized = "true";
    }
  }, []);

  useEffect(() => {
    const queued = getPendingFiles();
    if (!queued.length) return;
    clearPendingFiles();
    const file = queued[0];
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setStatus("The selected file is not a DOCX document. Open a .docx file to edit it here.");
      return;
    }
    let active = true;
    setLoading(true);
    setStatus("Opening the selected Word document…");
    import("mammoth").then(async mammoth => {
      const converted = await mammoth.convertToHtml(
        { arrayBuffer: await file.arrayBuffer() },
        { convertImage: mammoth.images.imgElement(async image => ({
          src: "data:" + image.contentType + ";base64," + await image.read("base64"),
        })) },
      );
      if (!converted.value.trim()) throw new Error("No editable document content could be read from this file.");
      if (active && editorRef.current) {
        editorRef.current.innerHTML = converted.value;
        setFilename(file.name);
        setDirty(false);
        setStatus(converted.messages.length
          ? "Document opened. Some advanced Word features may need review."
          : "Document opened from your workspace. Edit the page and export an editable DOCX.");
      }
    }).catch(error => {
      if (active) setStatus(error instanceof Error ? error.message : "Could not open the selected Word document.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setDirty(true);
  };

  const loadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setStatus("Please choose a .docx Word document. Legacy .doc files are not supported in this browser editor.");
      return;
    }
    setLoading(true);
    setStatus("Opening your Word document…");
    try {
      const mammoth = await import("mammoth");
      const converted = await mammoth.convertToHtml(
        { arrayBuffer: await file.arrayBuffer() },
        {
          convertImage: mammoth.images.imgElement(async (image) => ({
            src: "data:" + image.contentType + ";base64," + await image.read("base64"),
          })),
        },
      );
      if (!converted.value.trim()) throw new Error("No editable document content could be read from this file.");
      if (editorRef.current) {
        editorRef.current.innerHTML = converted.value;
        editorRef.current.dataset.initialized = "true";
      }
      setFilename(file.name);
      setDirty(false);
      setStatus(converted.messages.length
        ? "Document opened. Some advanced Word features may not have been imported; review the content before exporting."
        : "Document opened. Edit text, formatting, lists, tables and embedded images below.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "This Word document could not be opened.");
    } finally {
      setLoading(false);
    }
  };

  const startNewDocument = () => {
    if (dirty && !window.confirm("Discard the current unsaved edits and start a new document?")) return;
    if (editorRef.current) editorRef.current.innerHTML = INITIAL_HTML;
    setFilename("Untitled document.docx");
    setDirty(false);
    setStatus("New document created. Start typing on the page.");
  };

  const insertTable = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("insertHTML", false,
      '<table><tbody><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr></tbody></table><p><br /></p>');
    setDirty(true);
    setStatus("Editable table inserted. Click any cell to change its content.");
  };

  const insertImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editorRef.current) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Choose a supported image file.");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read this image."));
      reader.readAsDataURL(file);
    });
    editorRef.current.focus();
    document.execCommand("insertHTML", false, '<img src="' + dataUrl + '" alt="' + file.name.replace(/["<>]/g, "") + '" style="max-width:100%;height:auto" />');
    setDirty(true);
    setStatus("Image inserted. Drag its corners in the editor to resize it.");
  };

  const exportDocument = async () => {
    if (!editorRef.current) return;
    setExporting(true);
    setStatus("Building your editable Word document…");
    try {
      const blob = await htmlToDocx(editorRef.current.innerHTML);
      const outputName = filename.toLowerCase().endsWith(".docx") ? filename : filename + ".docx";
      downloadBlob(blob, outputName);
      setDirty(false);
      setStatus("Editable DOCX downloaded. Text, basic formatting, lists, tables and embedded images have been exported. Review advanced formatting before sharing.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not export the Word document.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="word-editor-app" aria-label="Browser-based Word editor">
      <header className="word-editor-topbar">
        <div className="word-editor-filebrand"><span className="word-editor-app-icon">W</span><div><b>ConvoTools Writer</b><small>{filename} {dirty ? "· Unsaved changes" : "· Saved locally"}</small></div></div>
        <div className="word-editor-top-actions">
          <button className="word-editor-secondary" onClick={startNewDocument}><FilePlus2 size={14}/> New</button>
          <button className="word-editor-secondary" onClick={() => fileRef.current?.click()}><Upload size={14}/> Open DOCX</button>
          <button className="word-editor-primary" onClick={exportDocument} disabled={exporting || loading}><Save size={14}/>{exporting ? "Exporting…" : "Export DOCX"}</button>
        </div>
      </header>
      <input ref={fileRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={loadFile}/>
      <input ref={imageRef} type="file" accept="image/*" hidden onChange={insertImage}/>
      <div className="word-editor-toolbar" role="toolbar" aria-label="Document formatting">
        <button title="Undo" onClick={() => runCommand("undo")}><Undo2/></button><button title="Redo" onClick={() => runCommand("redo")}><Redo2/></button>
        <i/>
        <select aria-label="Text style" onChange={event=>runCommand("formatBlock",event.target.value)} defaultValue="P"><option value="P">Normal text</option><option value="H1">Title</option><option value="H2">Heading 1</option><option value="H3">Heading 2</option><option value="BLOCKQUOTE">Quote</option></select>
        <select aria-label="Font size" value={fontSize} onChange={event=>{setFontSize(event.target.value);runCommand("fontSize",event.target.value);}}><option value="2">10 pt</option><option value="3">12 pt</option><option value="4">14 pt</option><option value="5">18 pt</option><option value="6">24 pt</option><option value="7">36 pt</option></select>
        <i/>
        <button title="Bold" onClick={()=>runCommand("bold")}><Bold/></button><button title="Italic" onClick={()=>runCommand("italic")}><Italic/></button><button title="Underline" onClick={()=>runCommand("underline")}><Underline/></button>
        <i/>
        <button title="Align left" onClick={()=>runCommand("justifyLeft")}><AlignLeft/></button><button title="Align center" onClick={()=>runCommand("justifyCenter")}><AlignCenter/></button><button title="Align right" onClick={()=>runCommand("justifyRight")}><AlignRight/></button>
        <i/>
        <button title="Bulleted list" onClick={()=>runCommand("insertUnorderedList")}><List/></button><button title="Numbered list" onClick={()=>runCommand("insertOrderedList")}><ListOrdered/></button>
        <button title="Insert image" onClick={()=>imageRef.current?.click()}><ImagePlus/></button><button title="Insert editable table" onClick={insertTable}><Table2/></button>
      </div>
      <div className="word-editor-canvas-wrap">
        <article
          ref={editorRef}
          className="word-editor-canvas"
          contentEditable={!loading && !exporting}
          suppressContentEditableWarning
          spellCheck
          role="textbox"
          aria-label="Editable Word document canvas"
          aria-multiline="true"
          onInput={()=>setDirty(true)}
        />
        {loading && <div className="word-editor-overlay"><LoaderCircle className="spin"/><span>Opening document…</span></div>}
      </div>
      <footer className="word-editor-status"><span><span className="word-editor-status-dot"/> {status}</span><span>Browser-based · DOCX</span></footer>
    </section>
  );
}
