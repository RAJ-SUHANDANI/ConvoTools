"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Sparkles } from "lucide-react";

const portrait =
  "https://images.unsplash.com/photo-1747671688812-76d7bca21f34?auto=format&fit=crop&w=1400&q=88";

export default function ImageComparison() {
  const [split, setSplit] = useState(48);

  return (
    <motion.div
      className="image-comparison"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <img className="comparison-after" src={portrait} alt="Clear natural-light outdoor portrait used as the comparison reference" />
      <img
        className="comparison-before"
        src={portrait}
        alt=""
        aria-hidden="true"
        style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
      />
      <span className="comparison-label comparison-label-before">SOFTER INPUT</span>
      <span className="comparison-label comparison-label-after">DETAIL REFERENCE</span>
      <motion.div className="comparison-divider" style={{ left: `${split}%` }} animate={{ left: `${split}%` }} transition={{ type: "spring", stiffness: 180, damping: 26 }}>
        <span><ArrowLeftRight size={15} /></span>
      </motion.div>
      <input
        className="comparison-range"
        type="range"
        min="8"
        max="92"
        value={split}
        onChange={(event) => setSplit(Number(event.target.value))}
        aria-label="Move the before and after image comparison divider"
      />
      <div className="comparison-hint"><Sparkles size={12} /> DRAG THE DIVIDER TO COMPARE</div>
      <div className="comparison-credit">
        <span>Portrait photo by Arturo Añez</span>
        <a href="https://unsplash.com/photos/a-smiling-woman-poses-outdoors-in-nature-nGnQpHSZaQ4" target="_blank" rel="noreferrer">Unsplash photo ↗</a>
      </div>
    </motion.div>
  );
}
