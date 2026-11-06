"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, FileImage, Heart,
  FileText, FileType2, LockKeyhole, Plus, Settings2, ShieldCheck,
  Sparkles, UploadCloud, X
} from "lucide-react";
import { motion } from "motion/react";
import BrandLogo from "@/components/BrandLogo";
import { processFiles, saveProcessedFile, type ProcessResult } from "@/lib/process-file";
import { acceptedInputForTool, detectFileCategory, formatFileSize, isAudioFile, isVideoFile } from "@/lib/file-actions";
import { clearPendingFiles, getPendingFiles } from "@/lib/file-session";
import { readFavorites, recordActivity, saveFavorites } from "@/lib/activity";
import { slugify } from "@/lib/tools";

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
  if (expected.includes("video") || expected.includes("mp4")) return category === "Video & audio" && isVideoFile(file);
  if (expected.includes("audio")) return category === "Video & audio" && isAudioFile(file);
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
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const accept = useMemo(() => acceptedInputForTool(tool.inputLabel || "", tool.category), [tool]);

  useEffect(() => {
    const queued = getPendingFiles();
    if (queued.length) {
      setFiles(queued);
      clearPendingFiles();
    }
    const slug = slugify(tool.name);
    setIsFavorite(readFavorites().includes(slug));
    recordActivity({
      type: "tool",
      title: tool.name,
      description: "Opened " + tool.category + " tool",
      category: tool.category,
      toolSlug: slug,
    });
  }, [tool.name, tool.category]);

  const addFiles = (list: FileList | File[]) => {
    const next = Array.from(list).filter((file) => file.size > 0);
    next.forEach((file) => recordActivity({
      type: "upload",
      title: file.name,
      filename: file.name,
      size: file.size,
      description: "Added to " + tool.name,
    }));
    setFiles(next);
    setResults([]);
    setNotice("");
  };

  const toggleFavorite = () => {
    const slug = slugify(tool.name);
    const current = readFavorites();
    const next = current.includes(slug) ? current.filter((value) => value !== slug) : [...current, slug];
    saveFavorites(next);
    setIsFavorite(next.includes(slug));
  };

  const onChoose = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };

  const invalidFiles = files.filter((file) => !compatible(tool, file));

  const startOperation = async () => {
    if (!files.length) { setNotice("Choose a file first to configure this operation."); inputRef.current?.click(); return; }
    if (invalidFiles.length) { setNotice("One or more files do not match this tool's expected input format."); return; }
    setProcessing(true); setResults([]); setNotice("Processing locally in your browser…");
    try {
      const completed = await processFiles(files, tool.name, { output, quality });
      setResults(completed);
      completed.forEach((result) => {
        saveProcessedFile(result);
        recordActivity({ type: "tool", title: tool.name + " completed", description: result.filename + " · " + result.message, category: tool.category, toolSlug: slugify(tool.name) });
      });
      setNotice(completed.length + " output " + (completed.length === 1 ? "file is" : "files are") + " ready. Your download" + (completed.length === 1 ? " has" : "s have") + " started.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Something went wrong while processing this file."); }
    finally { setProcessing(false); }
  };

  const options = [defaultOutput(tool)];
  const isAI = tool.category === "AI lab" || tool.name.toLowerCase().includes("enhancer") || tool.name.toLowerCase().includes("restoration");

  return (
    <main className="tool-page">
      <motion.header className="tool-page-header" initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <BrandLogo className="brand-tool" width={190} priority />
        <nav><Link href="/#toolkit">All tools</Link><Link href="/dashboard">Workspace</Link><a href="https://github.com/RAJ-SUHANDANI/ConvoTools" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={12} /></a></nav>
        <Link className="tool-header-cta" href="/dashboard">Open workspace <ArrowUpRight size={13} /></Link>
      </motion.header>

      <motion.div className="tool-breadcrumb" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.45 }}><Link href="/">Home</Link><span>/</span><Link href="/#toolkit">Tools</Link><span>/</span><b>{tool.name}</b></motion.div>

      <motion.section className="tool-detail-layout" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.09, delayChildren: 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}>
        <motion.div className="tool-detail-intro" variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}>
          <span className="tool-detail-kicker">{tool.category.toUpperCase()} TOOL <i /> CONVOTOOLS WORKSPACE</span>
          <h1>{tool.name.split(" to ").length > 1 ? <>{tool.name.split(" to ")[0]} <em>to</em><br />{tool.name.split(" to ")[1]}</> : <>{tool.name.split(" ").slice(0, -1).join(" ")} <em>{tool.name.split(" ").slice(-1)}</em></>}</h1>
          <p>{tool.description} Add your file, review the settings and choose how you want the output prepared.</p>
          <motion.div className="tool-detail-benefits" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}><span><ShieldCheck size={14} /> Local-first where supported</span><span><LockKeyhole size={14} /> No account required</span><span><Sparkles size={14} /> Batch-ready interface</span></motion.div>
          <div className="tool-detail-tip"><span>01</span><div><b>A focused page for this job.</b><p>No crowded dashboard. The controls here are dedicated to {tool.name.toLowerCase()}.</p></div></div>
          <motion.button className="tool-favorite-button" onClick={toggleFavorite} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Heart size={14} fill={isFavorite ? "currentColor" : "none"} /> {isFavorite ? "Saved to favorites" : "Save this tool"}
          </motion.button>
        </motion.div>

        <motion.div className="operation-card" variants={{ hidden: { opacity: 0, y: 18, scale: 0.99 }, visible: { opacity: 1, y: 0, scale: 1 } }}>
          <div className="operation-card-head"><div><span className="operation-step">STEP 01 / INPUT</span><h2>Add your file</h2><p>Expected format: <b>{tool.inputLabel || "Supported file"}</b></p></div><span className="operation-file-icon"><FileType2 size={21} /></span></div>
          <input ref={inputRef} type="file" accept={accept} multiple className="operation-input" onChange={onChoose} />
          <motion.button className={"operation-drop " + (files.length ? "has-files" : "")} onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }} whileHover={{ scale: 1.006, borderColor: "#5259d8" }} whileTap={{ scale: 0.995 }}>
            <span className="operation-upload-icon"><UploadCloud size={25} /></span>
            <b>{files.length ? "Replace selected files" : "Choose files or drop them here"}</b>
            <small>Multiple files supported · {tool.inputLabel || "Common formats"}</small>
            <span className="operation-browse">Browse files <ArrowUpRight size={13} /></span>
          </motion.button>

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

          {invalidFiles.length > 0 && <div className="format-warning"><FileImage size={15} /><span>This tool expects {tool.inputLabel}. Your selection includes a different file type. Try the universal workspace for matching actions.</span><Link href="/dashboard">Open workspace <ArrowUpRight size={12} /></Link></div>}

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

          <motion.button className="operation-submit" onClick={startOperation} disabled={processing || (files.length > 0 && invalidFiles.length > 0)} whileHover={{ y: -2, boxShadow: "0 10px 24px rgba(82,89,216,.18)" }} whileTap={{ scale: 0.99 }}><span>{processing ? "Processing…" : isAI ? "Run tool" : "Process & download"}</span><ArrowRight size={16} /></motion.button>
          {processing && <div className="operation-progress"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }} /></div>}
          {notice && <div className="operation-notice"><Sparkles size={14} /> {notice}</div>}
          {results.length > 0 && <div className="operation-results"><b><Check size={14} /> Output ready</b>{results.map((result) => <button key={result.filename} onClick={() => saveProcessedFile(result)}><FileText size={14} /><span>{result.filename}<small>{result.message}</small></span><ArrowUpRight size={13} /></button>)}</div>}
          <div className="operation-secure"><LockKeyhole size={12} /> Supported tools process locally in this browser. Files are not uploaded to a server.</div>
        </motion.div>
      </motion.section>
      <motion.section className="tool-page-bottom" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
        <div><span className="tool-detail-kicker">NOT THE RIGHT TOOL?</span><h2>Start with your file instead.</h2><p>Upload any common format and ConvoTools will suggest the actions that fit it.</p></div>
        <Link href="/dashboard">Open dashboard <ArrowUpRight size={14} /></Link>
      </motion.section>
    </main>
  );
}
