"use client";

import { motion } from "motion/react";
import { ArrowRight, Check, ScanText, Sparkles, WandSparkles } from "lucide-react";
import type { FileAction } from "@/lib/file-actions";

function iconFor(action: FileAction) {
  if (action.kind === "ai") return WandSparkles;
  if (action.kind === "extract") return ScanText;
  if (action.kind === "edit") return Sparkles;
  return ArrowRight;
}

export default function FileActionRadial({ options, activeId, onSelect }: { options: FileAction[]; activeId?: string; onSelect: (action: FileAction) => void }) {
  if (!options.length) return null;
  return <section className="file-action-picker" aria-label="Suggested file actions">
    <div className="file-action-picker-head">
      <div><span className="micro-label">SUGGESTED ACTIONS</span><b>Choose what happens next.</b></div>
      <span>{options.length} MATCHED TO THIS FILE</span>
    </div>
    <div className="file-action-grid">
      {options.map((action, index) => {
        const Icon = iconFor(action);
        const active = activeId === action.id;
        return <motion.button key={action.id} layout className={active ? "file-action-tile active" : "file-action-tile"}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .28, delay: index * .035, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3 }} whileTap={{ scale: .985 }}
          onClick={() => onSelect(action)} aria-pressed={active}>
          <span className="file-action-tile-icon"><Icon size={16} /></span>
          <span className="file-action-tile-copy"><b>{action.label}</b><small>{action.output}</small></span>
          <span className="file-action-tile-indicator">{active && <Check size={12} />}</span>
          <span className="file-action-tile-detail">{action.detail}</span>
        </motion.button>;
      })}
    </div>
  </section>;
}
