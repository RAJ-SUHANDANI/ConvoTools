"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight, FileArchive, FileImage,
  FileSpreadsheet, FileText, FileVideo, X
} from "lucide-react";
import { detectFileCategory, formatFileSize, getActionsForFile, type FileAction } from "@/lib/file-actions";
import FileActionRadial from "@/components/FileActionRadial";
import { setPendingFiles } from "@/lib/file-session";

type Props = {
  files: File[];
  onRemove?: (index: number) => void;
};

function fileIcon(category: string) {
  if (category === "Images") return FileImage;
  if (category === "PDF" || category === "Documents") return FileText;
  if (category === "Spreadsheets") return FileSpreadsheet;
  if (category === "Presentations") return FileText;
  if (category === "Video & audio") return FileVideo;
  if (category === "Archives") return FileArchive;
  return FileText;
}

export default function FileActionPanel({ files, onRemove }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, string>>({});

  const records = useMemo(() => files.map((file, index) => {
    const category = detectFileCategory(file);
    const options = getActionsForFile(file);
    const key = file.name + "-" + file.size + "-" + file.lastModified + "-" + index;
    return { file, category, options, key };
  }), [files]);

  if (!files.length) return null;

  const openAction = (file: File, action: FileAction) => {
    setPendingFiles([file]);
    router.push("/tools/" + action.toolSlug);
  };

  return (
    <div className="file-action-panel">
      <div className="file-action-panel-head">
        <div>
          <span className="micro-label">FILE INTELLIGENCE</span>
          <h3>Here&apos;s what you can do with them.</h3>
          <p>We identified each format and matched it with relevant actions.</p>
        </div>
        <span className="file-total">{files.length} FILE{files.length === 1 ? "" : "S"}</span>
      </div>
      <div className="detected-files">
        {records.map(({ file, category, options, key }, index) => {
          const Icon = fileIcon(category);
          const activeId = selected[key] || options[0]?.id;
          const activeAction = options.find((option) => option.id === activeId) || options[0];
          return (
            <article className="detected-file-card" key={key}>
              <div className="detected-file-top">
                <span className="detected-file-icon"><Icon size={19} /></span>
                <div className="detected-file-name">
                  <strong title={file.name}>{file.name}</strong>
                  <span>{category} <i /> {formatFileSize(file.size)} <i /> {file.type || "Type inferred from extension"}</span>
                </div>
                <span className="detected-badge"><span /> DETECTED</span>
                {onRemove && <button className="detected-remove" aria-label={"Remove " + file.name} onClick={() => onRemove(index)}><X size={15} /></button>}
              </div>
              <div className="action-picker action-picker-expanded">
                <FileActionRadial options={options} activeId={activeId} onSelect={(action) => setSelected((current) => ({ ...current, [key]: action.id }))} />
                {options.length === 0 && <div className="no-file-actions">We couldn&apos;t match this file to a supported action yet. Try another format or browse the tool library.</div>}
                {activeAction && (
                  <div className="chosen-action">
                    <div><b>{activeAction.label}</b><span>{activeAction.detail}</span></div>
                    <button onClick={() => openAction(file, activeAction)}>Open tool <ArrowUpRight size={14} /></button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <p className="file-action-disclaimer">Your files are selected in this browser session. Conversion starts on the dedicated tool page once its processing engine is connected.</p>
    </div>
  );
}
