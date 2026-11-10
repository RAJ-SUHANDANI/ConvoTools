"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, FileImage, FileSpreadsheet, FileText, LockKeyhole, Play, Zap } from "lucide-react";
import { Button } from "@animate-ui/react/primitives/buttons/button";
import { RippleButton, RippleButtonRipples } from "@animate-ui/react/primitives/buttons/ripple";
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number";
import { MorphingText } from "@animate-ui/react/primitives/texts/morphing";
import { RollingText } from "@animate-ui/react/primitives/texts/rolling";
import { TypingText } from "@animate-ui/react/primitives/texts/typing";
import { Fade } from "@animate-ui/react/primitives/effects/fade";
import { GradientBackground } from "@/components/animate-ui/backgrounds/gradient";
import { HexagonBackground } from "@/components/animate-ui/backgrounds/hexagon";
import { FileCheck } from "@/components/animate-ui/icons/file-check";
import { Upload } from "@/components/animate-ui/icons/upload";
import { ArrowRight as MotionArrow } from "@/components/animate-ui/icons/arrow-right";

export function HeroStage({ children }: { children: ReactNode }) {
  return (
    <div className="ct-hero-stage">
      <GradientBackground className="ct-hero-ambient" aria-hidden="true" transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
      <div className="ct-hero-satellite ct-hero-satellite-one"><FileCheck size={19} animateOnHover /><span>Nothing to install</span></div>
      <div className="ct-hero-satellite ct-hero-satellite-two"><Zap size={15}/><span>Ready in your browser</span></div>
      <div className="ct-hero-main-window">{children}</div>
      <div className="ct-hero-axis" aria-hidden="true"><span>01</span><i/><span>02</span><i/><span>03</span></div>
    </div>
  );
}

const DEMOS = [
  { label: "PDF to Word", from: "PDF", to: "DOCX", slug: "pdf-to-word", icon: FileText, description: "Take selectable text, tables and images from a PDF into an editable Word document. Complex layouts may need review.", filename: "project-brief.pdf" },
  { label: "PNG to JPG", from: "PNG", to: "JPG", slug: "png-to-jpg", icon: FileImage, description: "Convert a PNG into a widely compatible JPEG. Transparent pixels are placed on a white background.", filename: "campaign-cover.png" },
  { label: "CSV to XLSX", from: "CSV", to: "XLSX", slug: "csv-to-xlsx", icon: FileSpreadsheet, description: "Move comma-separated records into an editable spreadsheet workbook, ready to continue working.", filename: "project-data.csv" }
] as const;

export function ConversionMotion() {
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState(false);
  const reduced = useReducedMotion();
  const chosen = DEMOS[active];
  const Icon = chosen.icon;
  const pick = (index: number) => { setActive(index); setPreview(false); };

  return (
    <section className="ct-motion-section" id="live-preview" aria-labelledby="ct-motion-title">
      <div className="ct-motion-heading">
        <Fade inView>
          <div className="ct-motion-overline"><span className="ct-motion-asterisk">✳</span> THIS IS WHAT THE WORK FEELS LIKE <span className="ct-motion-rule"/></div>
        </Fade>
        <div className="ct-motion-heading-grid">
          <Fade inView><h2 id="ct-motion-title">Less setup.<br/><span>More done.</span></h2></Fade>
          <Fade inView><p>One file in. The right format out. Choose a sample workflow below to see the interface respond—then open the real tool when you&apos;re ready.</p></Fade>
        </div>
      </div>

      <div className="ct-motion-workbench">
        <div className="ct-motion-controls">
          <span className="ct-motion-micro">INTERACTIVE WORKFLOW PREVIEW / 01—03</span>
          <h3><RollingText text="From there to done." inView /></h3>
          <p>Switch between everyday jobs. Every preview links directly to its working converter.</p>
          <div className="ct-motion-choices" role="group" aria-label="Choose a sample file workflow">
            {DEMOS.map((item,index)=><RippleButton key={item.slug} type="button"
                className={"ct-motion-choice"+(active===index?" is-active":"")}
                aria-pressed={active===index} tapScale={0.98} onClick={()=>pick(index)}>
                <span className="ct-motion-choice-icon"><item.icon size={19} /></span>
                <span><b>{item.label}</b><small>{item.from} <span aria-hidden="true">→</span> {item.to}</small></span>
                <span className="ct-motion-choice-indicator">{active===index?<Check size={15}/>:<ArrowUpRight size={15}/>}</span>
                <RippleButtonRipples color="rgba(221,255,129,.35)"/>
              </RippleButton>)}
          </div>
          <div className="ct-motion-control-footer">
            <span><LockKeyhole size={14}/> Browser-based processing</span>
            <Link href="/privacy">How your files are handled <ArrowUpRight size={13}/></Link>
          </div>
        </div>
        <div className="ct-motion-visual">
          <HexagonBackground className="ct-motion-hexagons" hexagonSize={82} hexagonMargin={3} aria-hidden="true" />
          <div className="ct-motion-visual-top"><span className="ct-live-dot"/> LIVE WORKFLOW PREVIEW <span>CONVOTOOLS / STUDIO</span></div>
          <div className="ct-motion-board" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div key={chosen.slug} className="ct-motion-paper-stack"
                initial={reduced?{opacity:1}:{opacity:0,rotateY:-25,y:35,scale:.93}}
                animate={{opacity:1,rotateY:0,y:0,scale:1}}
                exit={reduced?{opacity:0}:{opacity:0,rotateY:20,y:-18,scale:.95}}
                transition={{duration:.4,ease:[.23,1,.32,1]}}>
                <div className="ct-motion-sheet ct-motion-sheet-in">
                  <span className="ct-motion-sheet-head"><Icon size={18}/><b>{chosen.from}</b></span>
                  <div className="ct-motion-sample-lines"><i/><i/><i/><i/></div>
                  <small>{chosen.filename}</small>
                </div>
                <motion.div className="ct-motion-transform"
                  animate={reduced?{}:{x:[-3,5,-3]}} transition={{repeat:Infinity,duration:2.6,ease:"easeInOut"}}>
                  <MotionArrow size={23} animateOnHover />
                </motion.div>
                <div className="ct-motion-sheet ct-motion-sheet-out">
                  <span className="ct-motion-sheet-head"><FileCheck size={18} animateOnHover/><b>{chosen.to}</b></span>
                  <div className="ct-motion-sample-lines"><i/><i/><i/><i/></div>
                  <small>{chosen.to.toLowerCase()} ready</small>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="ct-motion-feedback">
            <span className="ct-motion-feedback-label">SELECTED WORKFLOW</span>
            <div><MorphingText key={chosen.slug} text={chosen.from+" → "+chosen.to} className="ct-motion-output-label"/></div>
            <p>{chosen.description}</p>
          </div>
          <div className="ct-motion-visual-footer">
            <Button className="ct-motion-try" onClick={()=>setPreview(!preview)} tapScale={.96}>
              <Play size={15} fill="currentColor" /> {preview?"Hide steps":"Show how it works"}
            </Button>
            <Link className="ct-motion-go" href={"/tools/"+chosen.slug}>Open {chosen.label} <MotionArrow size={19} animateOnHover/></Link>
          </div>
          <AnimatePresence>
            {preview && <motion.div className="ct-motion-steps" initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.24}}>
              <span>01 · Add a file</span><span>02 · Adjust the output</span><span>03 · Process and download</span>
            </motion.div>}
          </AnimatePresence>
        </div>
      </div>

      <div className="ct-motion-stats" aria-label="ConvoTools at a glance">
        <div><span>AVAILABLE FILE TOOLS</span><strong><CountingNumber number={38} inView /> <small>/ 42 total</small></strong></div>
        <div><span>TOOL CATEGORIES</span><strong><CountingNumber number={10} inView /></strong></div>
        <div><span>ACCOUNT REQUIRED</span><strong><CountingNumber number={0} initiallyStable /></strong></div>
        <div className="ct-motion-stats-note"><span>BUILT FOR REAL WORK</span><TypingText text="Pick a file. Choose an action. Keep moving." duration={55} inView /></div>
      </div>
    </section>
  );
}
