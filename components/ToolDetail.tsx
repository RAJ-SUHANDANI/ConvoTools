"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, FileImage,
  FileText, FileType2, LockKeyhole, Plus, Settings2, ShieldCheck,
  Sparkles, UploadCloud, X
} from "lucide-react";
import { motion } from "framer-motion";
import { acceptedInputForTool, detectFileCategory, formatFileSize } from "@/lib/file-actions";
import { clearPendingFiles, getPendingFiles } from "@/lib/file-session";

type ToolData = {
  name: string;
  description: string;
  category: string;
  inputLabel?: string;
  outputLabel?: string;
};

const outputOptions: Record<string, string[]> = {
  Images: ["PDF", "JPG", "PNG", "WEBP", "DOCX · OCR"],
  PDF: ["DOCX", "XLSX", "PPTX", "JPG", "PNG", "PDF"],
  Documents: ["PDF", "DOCX", "TXT", "RTF"],
  Spreadsheets: ["PDF", "XLSX", "CSV", "ODS"],
  Presentations: ["PDF", "PPTX", "PNG", "JPG"],
  "Video & audio": ["MP4", "WEBM", "GIF", "MP3", "WAV"],
  "AI lab": ["Enhanced PNG", "Enhanced JPG", "WEBP"],
  Archives: ["ZIP", "Extract files"],
  Developer: ["JSON", "TXT", "Base64"],
  Other: ["PDF"],
};

function defaultOutput(tool: ToolData) {
  return tool.outputLabel || outputOptions[tool.category]?.[0] || "PDF";
}

function compatible(tool: ToolData, file: File) {
  const expected = (tool.inputLabel || "").toLowerCase();
  const category = detectFileCategory(file);
  if (!expected || expected === "any file" || expected === "text / file" || expected === "files") return true;
  if (expected.includes("image") && category === "Images") return true;
  if (expected.includes("image or pdf") && (category === "Images" || category === "PDF")) return true;
  if (expected.includes("pdf")) return category === "PDF";
  if (expected.includes("docx") || expected.includes("word") || expected === "document") return category === "Documents";
  if (expected.includes("xlsx") || expected.includes("csv")) return category === "Spreadsheets";
  if (expected.includes("pptx")) return category === "Presentations";
  if (expected.includes("video") || expected.includes("audio") || expected.includes("mp4")) return category === "Video & audio";
  if (expected.includes("zip")) return category === "Archives";
  if (expected.includes("json")) return file.name.toLowerCase().endsWith(".json");
  return true;
}

export default function ToolDetail({ tool }: { tool: ToolData }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [output, setOutput] = useState(defaultOutput(tool));
  const [quality, setQuality] = useState("Balanced");
  const [keepMetadata, setKeepMetadata] = useState(true);
  const [notice, setNotice] = useState("");
  const accept = useMemo(() => acceptedInputForTool(tool.inputLabel || "", tool.category), [tool]);

  useEffect(() => {
    const queued = getPendingFiles();
    if (queued.length) {
      setFiles(queued);
      clearPendingFiles();
    }
  }, []);

  const addFiles = (list: FileList | File[]) => {
    setFiles(Array.from(list).filter((file) => file.size > 0));
    setNotice("");
  };

  const onChoose = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };

  const invalidFiles = files.filter((file) => !compatible(tool, file));
  const readyFiles = files.filter((file) => compatible(tool, file));

  const startOperation = () => {
    if (!files.length) {
      setNotice("Choose a file first to configure this operation.");
      inputRef.current?.click();
      return;
    }
    if (invalidFiles.length) {
      setNotice("One or more files do not match this tool's expected input format.");
      return;
    }
    setNotice("Your settings are ready. The " + tool.name + " processing engine will be connected in the next implementation phase.");
  };

  const options = [defaultOutput(tool)];
  const isAI = tool.category === "AI lab" || tool.name.toLowerCase().includes("enhancer") || tool.name.toLowerCase().includes("restoration");

  return (
    <main className="tool-page">
      <header className="tool-page-header">
        <Link className="tool-page-brand" href="/"><span className="mini-brand-mark"><i /><i /><i /></span> convotools</Link>
        <nav><Link href="/#toolkit">All tools</Link><Link href="/workspace">Workspace</Link><a href="https://github.com/RAJ-SUHANDANI/ConvoTools" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={12} /></a></nav>
        <Link className="tool-header-cta" href="/workspace">Open workspace <ArrowUpRight size={13} /></Link>
      </header>

      <div className="tool-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/#toolkit">Tools</Link><span>/</span><b>{tool.name}</b></div>

      <section className="tool-detail-layout">
        <div className="tool-detail-intro">
          <span className="tool-detail-kicker">{tool.category.toUpperCase()} TOOL <i /> CONVOTOOLS WORKSPACE</span>
          <h1>{tool.name.split(" to ").length > 1 ? <>{tool.name.split(" to ")[0]} <em>to</em><br />{tool.name.split(" to ")[1]}</> : <>{tool.name.split(" ").slice(0, -1).join(" ")} <em>{tool.name.split(" ").slice(-1)}</em></>}</h1>
          <p>{tool.description} Add your file, review the settings and choose how you want the output prepared.</p>
          <div className="tool-detail-benefits"><span><ShieldCheck size={14} /> Local-first where supported</span><span><LockKeyhole size={14} /> No account required</span><span><Sparkles size={14} /> Batch-ready interface</span></div>
          <div className="tool-detail-tip"><span>01</span><div><b>A focused page for this job.</b><p>No crowded dashboard. The controls here are dedicated to {tool.name.toLowerCase()}.</p></div></div>
        </div>

        <div className="operation-card">
          <div className="operation-card-head"><div><span className="operation-step">STEP 01 / INPUT</span><h2>Add your file</h2><p>Expected format: <b>{tool.inputLabel || "Supported file"}</b></p></div><span className="operation-file-icon"><FileType2 size={21} /></span></div>
          <input ref={inputRef} type="file" accept={accept} multiple className="operation-input" onChange={onChoose} />
          <button className={"operation-drop " + (files.length ? "has-files" : "")} onClick={() => inputRef.current?.click()}>
            <span className="operation-upload-icon"><UploadCloud size={25} /></span>
            <b>{files.length ? "Replace selected files" : "Choose files or drop them here"}</b>
            <small>Multiple files supported · {tool.inputLabel || "Common formats"}</small>
            <span className="operation-browse">Browse files <ArrowUpRight size={13} /></span>
          </button>

          {files.length > 0 && (
            <div className="operation-file-list">
              {files.map((file, index) => (
                <div className="operation-file-row" key={file.name + file.size + index}>
                  <span className="operation-file-thumb"><FileText size={16} /></span>
                  <span className="operation-file-info"><b>{file.name}</b><small>{detectFileCategory(file)} · {formatFileSize(file.size)}</small></span>
                  <span className={compatible(tool, file) ? "file-valid" : "file-invalid"}>{compatible(tool, file) ? <><Check size={12} /> Compatible</> : <>Wrong type</>}</span>
                  <button onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={"Remove " + file.name}><X size={14} /></button>
                </div>
              ))}
            </div>
          )}

          {invalidFiles.length > 0 && <div className="format-warning"><FileImage size={15} /><span>This tool expects {tool.inputLabel}. Your selection includes a different file type. Try the universal workspace for matching actions.</span><Link href="/workspace">Find compatible tools <ArrowUpRight size={12} /></Link></div>}

          <div className="operation-divider" />
          <div className="operation-card-head settings-head"><div><span className="operation-step">STEP 02 / OUTPUT</span><h2>Choose your settings</h2><p>Adjust the output before preparing your file.</p></div><span className="settings-icon"><Settings2 size={19} /></span></div>
          <label className="field-label" htmlFor="output-format">Output format</label>
          <div className="select-wrap"><select id="output-format" value={output} onChange={(event) => setOutput(event.target.value)}>{(options.includes(defaultOutput(tool)) ? options : [defaultOutput(tool), ...options]).map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={15} /></div>
          {(tool.name.toLowerCase().includes("compress") || tool.category === "Images" || tool.category === "Video & audio") && (
            <>
              <label className="field-label" htmlFor="quality-select">Quality preset</label>
              <div className="select-wrap"><select id="quality-select" value={quality} onChange={(event) => setQuality(event.target.value)}><option>Smaller file</option><option>Balanced</option><option>Best quality</option></select><ChevronDown size={15} /></div>
            </>
          )}
          <label className="metadata-toggle"><input type="checkbox" checked={keepMetadata} onChange={(event) => setKeepMetadata(event.target.checked)} /><span className="fake-check"><Check size={11} /></span><span><b>Keep original metadata when possible</b><small>Preserve dates, orientation and other available file information.</small></span></label>

          <button className="operation-submit" onClick={startOperation} disabled={files.length > 0 && invalidFiles.length > 0}><span>{isAI ? "Prepare enhancement" : "Prepare conversion"}</span><ArrowRight size={16} /></button>
          {notice && <div className="operation-notice"><Sparkles size={14} /> {notice}</div>}
          <div className="operation-secure"><LockKeyhole size={12} /> Files are only held in this browser preview. Processing is not yet enabled.</div>
        </div>
      </section>
      <section className="tool-page-bottom">
        <div><span className="tool-detail-kicker">NOT THE RIGHT TOOL?</span><h2>Start with your file instead.</h2><p>Upload any common format and ConvoTools will suggest the actions that fit it.</p></div>
        <Link href="/workspace">Open universal workspace <ArrowUpRight size={14} /></Link>
      </section>
    </main>
  );
}
