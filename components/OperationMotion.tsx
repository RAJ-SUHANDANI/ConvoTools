"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Check, Download, FileCheck2 } from "lucide-react";

export function LoadingPath() {
  return <div className="operation-loading-visual" role="status" aria-live="polite">
    <motion.svg viewBox="0 0 118 42" aria-hidden="true">
      <motion.path d="M8 29 C23 4 35 4 48 21 S72 39 83 18 S102 4 110 13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"
        initial={{ pathLength: .08, pathOffset: 0 }} animate={{ pathLength: [.08, .94, .22], pathOffset: [0, .9, 1.8] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "linear" }} />
      <motion.circle cx="8" cy="29" r="3" fill="currentColor" animate={{ opacity: [1, .3, 1], scale: [1, .7, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
    </motion.svg>
    <span>WORKING THROUGH YOUR FILE</span>
  </div>;
}

export function ProgressMeter({ progress, determinate }: { progress: number; determinate: boolean }) {
  return <div className="operation-progress-shell" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={determinate ? Math.round(progress * 100) : undefined} aria-label="File processing progress">
    <div className="operation-progress-track"><motion.i initial={{ scaleX: 0 }} animate={determinate ? { scaleX: Math.max(0, Math.min(1, progress)) } : { scaleX: [0.08, .76, .08] }}
      transition={determinate ? { duration: .2, ease: "linear" } : { duration: 1.55, repeat: Infinity, ease: "easeInOut" }} /></div>
    <span>{determinate ? Math.round(progress * 100) + "%" : "IN PROGRESS"}</span>
  </div>;
}

export function DownloadCelebration({ run }: { run: number }) {
  return <motion.div key={run} className="download-celebration" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: .35 }}>
    <div className="download-flight-scene">
      <div className="download-flight-track" />
      <motion.div className="download-flight-logo" initial={{ offsetDistance: "0%", scale: .92, opacity: 0 }} animate={{ offsetDistance: ["0%", "100%"], scale: [.92, .65, .35], opacity: [0, 1, 0] }}
        transition={{ duration: 1.15, ease: [0.22, 1, .36, 1] }}>
        <Image src="/convotools-mark.svg" alt="" width={44} height={44} />
      </motion.div>
      <motion.span className="download-flight-target" initial={{ scale: .82 }} animate={{ scale: [ .82, 1.1, 1 ] }} transition={{ delay: .9, duration: .42 }}><Download size={18} /></motion.span>
      <motion.i className="download-flight-ripple" initial={{ scale: .5, opacity: 0 }} animate={{ scale: [ .5, 1.8 ], opacity: [ .65, 0 ] }} transition={{ delay: .96, duration: .55 }} />
    </div>
    <div className="download-celebration-copy"><b><Check size={14} /> Your file is ready.</b><span><FileCheck2 size={12} /> ConvoTools has sent the download to your browser.</span></div>
  </motion.div>;
}
