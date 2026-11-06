"use client";

import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownToLine, ArrowRight, ChevronDown, ScanText, Sparkles, WandSparkles } from "lucide-react";
import type { FileAction } from "@/lib/file-actions";

function iconFor(action: FileAction) {
  if (action.kind === "ai") return WandSparkles;
  if (action.kind === "extract") return ScanText;
  if (action.kind === "edit") return Sparkles;
  return ArrowRight;
}

export default function FileActionRadial({ options, activeId, onSelect }: { options: FileAction[]; activeId?: string; onSelect: (action: FileAction) => void }) {
  const [open, setOpen] = useState(true);
  const active = options.find((item) => item.id === activeId) || options[0];
  const ActiveIcon = active ? iconFor(active) : ArrowDownToLine;
  if (!options.length) return null;
  return <div className="radial-action-picker">
    <div className="radial-action-caption"><span>CHOOSE AN ACTION</span><small>{options.length} SUGGESTED</small></div>
    <div className={"radial-action-stage" + (open ? " is-open" : " is-closed")}>
      <AnimatePresence>
        {open && <motion.div className="radial-action-orbit" initial={{ opacity: 0, scale: .82 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .82 }} transition={{ duration: .22 }}>
          {options.map((action, index) => {
            const Icon = iconFor(action);
            const angle = -Math.PI / 2 + (index / options.length) * Math.PI * 2;
            const radiusX = options.length <= 4 ? 106 : 142;
            const radiusY = options.length <= 4 ? 78 : 116;
            const style = { left: `calc(50% + ${Math.cos(angle) * radiusX}px)`, top: `calc(50% + ${Math.sin(angle) * radiusY}px)`, "--item-order": index } as CSSProperties;
            return <motion.button key={action.id} className={active?.id === action.id ? "radial-action-option selected" : "radial-action-option"} style={style}
              initial={{ opacity: 0, scale: .45, x: 0, y: 0 }} animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }} exit={{ opacity: 0, scale: .4, x: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 430, damping: 25, delay: index * .035 }} onClick={() => { onSelect(action); setOpen(false); }}>
              <span className="radial-action-icon"><Icon size={14} /></span><span><b>{action.label}</b><small>{action.output}</small></span>
            </motion.button>;
          })}
        </motion.div>}
      </AnimatePresence>
      <motion.button className="radial-action-hub" onClick={() => setOpen((value) => !value)} whileTap={{ scale: .95 }} aria-expanded={open}>
        <span className="radial-hub-icon"><ActiveIcon size={20} /></span><small>{open ? "PICK AN ACTION" : "SELECTED ACTION"}</small><b>{active?.label || "Choose an action"}</b><i><ChevronDown size={14} /></i>
      </motion.button>
    </div>
    <p className="radial-action-hint">{open ? "Choose a route around the file." : "Open the action wheel to change your selection."}</p>
  </div>;
}
