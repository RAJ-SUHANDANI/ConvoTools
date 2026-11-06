"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Command, LockKeyhole, UploadCloud } from "lucide-react";
import FileActionPanel from "@/components/FileActionPanel";

export default function WorkspacePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const addFiles = (incoming: FileList | File[]) => {
    setFiles((current) => [...current, ...Array.from(incoming).filter((file) => file.size > 0)].slice(0, 30));
  };
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  return (
    <main className="universal-page">
      <header className="universal-header">
        <Link className="tool-page-brand" href="/"><span className="mini-brand-mark"><i /><i /><i /></span> convotools</Link>
        <Link className="back-home" href="/"><ArrowLeft size={14} /> Back to home</Link>
      </header>
      <section className="universal-hero">
        <span className="tool-detail-kicker">THE UNIVERSAL FILE WORKSPACE</span>
        <h1>Start with a file.<br /><em>We&apos;ll find the next step.</em></h1>
        <p>Upload almost any common format. ConvoTools identifies what you have and suggests the most useful actions for that file.</p>
      </section>
      <section className="universal-content">
        <input ref={inputRef} type="file" multiple className="operation-input" onChange={onChange} />
        <div className={"universal-drop " + (dragging ? "drag-active" : "")} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={onDrop}>
          <div className="universal-drop-icon"><UploadCloud size={29} /></div>
          <h2>{dragging ? "Drop your files to identify them." : "Drop files to get started."}</h2>
          <p>Images, PDFs, Office documents, spreadsheets, presentations, video, audio and archives.</p>
          <button onClick={() => inputRef.current?.click()}>Browse files <ArrowUpRight size={14} /></button>
          <span><LockKeyhole size={12} /> Files stay in this browser preview</span>
        </div>
        <FileActionPanel files={files} onRemove={(index) => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} />
        <div className="universal-footer-note"><Command size={13} /> Need a specific job? <Link href="/#toolkit">Browse the full tool library</Link></div>
      </section>
    </main>
  );
}
