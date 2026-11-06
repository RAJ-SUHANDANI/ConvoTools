"use client";

import {
  ArrowDownRight, ArrowRight, ArrowUpRight, AudioLines, BadgeCheck, Braces,
  Check, ChevronRight, Code2, Copy, FileImage, FilePenLine, FileSpreadsheet, FileText, Film, Image as ImageIcon, Layers3, LockKeyhole, Merge,
  Minimize2, PanelTop, Plus, ScanText, Search, ShieldCheck,
  SlidersHorizontal, Sparkles, UploadCloud, Zap
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FileActionPanel from "@/components/FileActionPanel";
import ImageComparison from "@/components/ImageComparison";
import BrandLogo from "@/components/BrandLogo";
import { recordActivity } from "@/lib/activity";
import { TOOLS, TOOL_CATEGORIES, slugify } from "@/lib/tools";
import { AIGallery, FooterReveal, LandingNav, ScrollTextLines, TypewriterHeading, WorkflowWaypoints } from "@/components/LandingEnhancements";

export default function Home() {
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [category, setCategory] = useState("All tools");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const addFiles = (incoming: FileList | File[]) => {
    const next = Array.from(incoming).filter((file) => file.size > 0);
    next.forEach((file) => recordActivity({
      type: "upload",
      title: file.name,
      filename: file.name,
      size: file.size,
      description: "Added to the universal file workspace",
    }));
    setFiles((current) => [...current, ...next].slice(0, 30));
  };

  const onChoose = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const filteredTools = useMemo(() => {
    const search = query.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      const matchesCategory = category === "All tools" || tool.category === category;
      const matchesSearch = !search || (tool.name + " " + tool.description + " " + tool.category).toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [category, query]);

  return (
    <main className="app-shell" id="top">
      <div className="announcement-bar">
        <span className="announcement-pulse" />
        <span>THE FILE WORKSPACE FOR PEOPLE WHO MAKE THINGS</span>
        <span className="announcement-divider" />
        <a href="#toolkit">Explore the toolkit <ArrowUpRight size={12} /></a>
      </div>

      <LandingNav />

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="hero-section">
        <div className="hero-main">
          <motion.div className="hero-copy" initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}>
            <div className="eyebrow"><span className="eyebrow-rule" /> ONE WORKSPACE. A LOT LESS BUSYWORK.</div>
            <TypewriterHeading />
            <p className="hero-lede">Convert, refine, organize and edit the files that keep your day moving. One considered toolkit, from quick fixes to bigger workflows.</p>
            <div className="hero-ctas">
              <a className="button-primary" href="/dashboard">Start with a file <ArrowUpRight size={16} /></a>
              <a className="button-text" href="#toolkit">See everything you can do <ArrowDownRight size={16} /></a>
            </div>
            <div className="hero-note"><span className="hero-note-mark"><LockKeyhole size={14} /></span><span><strong>Private by default.</strong> Local-first tools wherever practical.</span></div>
          </motion.div>
          <motion.div className="hero-product" initial={reducedMotion ? false : { opacity: 0, y: 30, rotate: 1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
            <div className="product-window">
              <div className="window-topbar">
                <div className="window-dots"><i /><i /><i /></div>
                <span className="window-path">CONVOTOOLS <b>/</b> WORKSPACE</span>
                <span className="window-avatar">R</span>
              </div>
              <div className="window-content">
                <div className="window-heading">
                  <div><span className="micro-label">YOUR FILE DESK</span><h3>What are we working on?</h3></div>
                  <span className="window-live"><i /> READY</span>
                </div>
                <div className="window-dropzone">
                  <div className="window-upload-icon"><UploadCloud size={23} /></div>
                  <div><strong>Drop anything here</strong><small>PDF, image, document, spreadsheet & more</small></div>
                  <span className="window-plus"><Plus size={17} /></span>
                </div>
                <div className="window-or">OR PICK A STARTING POINT</div>
                <div className="window-quick-actions">
                  <div><span className="quick-icon pdf"><FileText size={17} /></span><b>PDF tools</b><small>Merge, compress, edit</small></div>
                  <div><span className="quick-icon image"><ImageIcon size={17} /></span><b>Image lab</b><small>Convert, sharpen, resize</small></div>
                  <div><span className="quick-icon doc"><FilePenLine size={17} /></span><b>Documents</b><small>Export, extract, edit</small></div>
                </div>
                <div className="window-footer"><span><ShieldCheck size={12} /> FILES STAY YOURS</span><span>SESSION READY <i /></span></div>
              </div>
            </div>
            <div className="floating-file floating-file-a"><span className="floating-file-icon f-pdf"><FileText size={18} /></span><span><b>brief-final.pdf</b><small>PDF · 2.4 MB</small></span><BadgeCheck size={15} /></div>
            <div className="floating-file floating-file-b"><span className="floating-file-icon f-img"><ImageIcon size={18} /></span><span><b>campaign_hero.png</b><small>IMAGE · 4.8 MB</small></span></div>
            <div className="hero-index">01 <span>—</span> THE NEW FILE DESK</div>
          </motion.div>
        </div>
        <div className="hero-bottom">
          <span>BUILT FOR EVERYDAY FILE WORK</span>
          <div className="format-list"><b>PDF</b><i /><b>DOCX</b><i /><b>XLSX</b><i /><b>PPTX</b><i /><b>JPG</b><i /><b>MP4</b><i /><b>ZIP</b></div>
          <span className="hero-bottom-right">SCROLL TO EXPLORE <ArrowDownRight size={13} /></span>
        </div>
      </motion.section>

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="intro-band">
        <div className="intro-band-inner">
          <p>THE SMALL STUFF ADDS UP.</p>
          <h2>One file. Five detours. <em>Not anymore.</em></h2>
          <span>ConvoTools brings the everyday file jobs together, so you can spend less time searching for a converter and more time getting on with your work.</span>
          <ScrollTextLines />
        </div>
      </motion.section>

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="workspace-section section-pad" id="workspace">
        <div className="section-topline">
          <div><span className="section-kicker">01 / YOUR WORKSPACE</span><h2>Start with what<br /><em>you have.</em></h2></div>
          <p>No need to pick a tool first. Add a file and choose what you want to do next.</p>
        </div>
        <div className={"drop-workspace" + (dragging ? " drag-active" : "")}
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }}
          onDrop={onDrop}>
          <input ref={fileInput} className="file-input" type="file" multiple onChange={onChoose} />
          <div className="drop-left">
            <div className="drop-icon"><UploadCloud size={25} /></div>
            <div className="drop-copy"><span className="micro-label">DRAG, DROP, DONE</span><h3>{dragging ? "That's it. Let go." : "Bring your files here."}</h3><p>Drop one file or a whole batch. We&apos;ll help you find the next step.</p></div>
          </div>
          <div className="drop-right">
            <button className="button-dark" onClick={() => fileInput.current?.click()}>Choose files <Plus size={15} /></button>
            <span>Up to 30 files in this preview</span>
          </div>
          <div className="drop-bottom"><span><LockKeyhole size={12} /> Files are held in this browser session</span><span>PDF · IMAGE · OFFICE · VIDEO · AUDIO · ARCHIVE</span></div>
        </div>
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div className="file-action-reveal" initial={{ opacity: 0, height: 0, y: 12 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0 }}>
              <FileActionPanel files={files} onRemove={(index) => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="toolkit-section section-pad" id="toolkit">
        <div className="section-topline toolkit-heading">
          <div><span className="section-kicker">02 / THE TOOLKIT</span><h2>Every format has<br /><em>a next move.</em></h2></div>
          <p>From everyday conversions to the jobs that usually need three different websites. Explore by task or search for exactly what you need.</p>
        </div>
        <div className="tool-browser">
          <div className="tool-browser-head">
            <div className="tool-browser-label"><span className="browser-led" /> BROWSE THE TOOL LIBRARY <span className="tool-library-count">{TOOLS.length} TOOLS IN THE LIBRARY</span></div>
            <label className="tool-search"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setShowAll(true); }} placeholder="Search a tool or format..." /><kbd>/</kbd></label>
          </div>
          <div className="tool-browser-body">
            <aside className="category-rail">
              <span className="micro-label">CATEGORIES</span>
              {TOOL_CATEGORIES.map((item) => (
                <button key={item.name} className={category === item.name ? "category-option selected" : "category-option"} onClick={() => { setCategory(item.name); setShowAll(false); }}>
                  <span>{item.name}</span><ChevronRight size={14} />
                </button>
              ))}
              <div className="category-rail-note"><Sparkles size={15} /><span>New tools are added as the workspace grows.</span></div>
            </aside>
            <div className="tool-results">
              <div className="tool-results-head"><div><span className="micro-label">SHOWING</span><h3>{category === "All tools" ? "The full toolbox" : category}</h3></div><span>{filteredTools.length} RESULTS</span></div>
              <div className="tool-result-grid">
                <AnimatePresence mode="popLayout">
                  {(showAll ? filteredTools : filteredTools.slice(0, 12)).map((tool, index) => {
                    const Icon = tool.icon;
                    return (
                      <motion.button layout key={tool.name} className="tool-result" onClick={() => router.push("/tools/" + slugify(tool.name))} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .97 }} transition={{ duration: .25, delay: index * .012 }} whileHover={{ y: -3, scale: 1.005 }} whileTap={{ scale: 0.99 }}>
                        <span className="tool-result-icon"><Icon size={18} strokeWidth={1.7} /></span>
                        <span className="tool-result-copy"><b>{tool.name}</b><small>{tool.description}</small></span>
                        {tool.tag && <span className={"tool-tag" + (tool.tag === "AI" ? " tag-ai" : "")}>{tool.tag}</span>}
                        <ArrowUpRight className="tool-result-arrow" size={15} />
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
                {filteredTools.length === 0 && <div className="no-results"><Search size={20} /><b>No matching tools</b><span>Try another search or switch category.</span></div>}
              </div>
              {filteredTools.length > 12 && <button className="show-more" onClick={() => setShowAll((value) => !value)}>{showAll ? "Show fewer tools" : "Show all " + filteredTools.length + " tools"} <ArrowRight size={15} /></button>}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="category-feature section-pad" id="pdf">
        <div className="category-heading">
          <span className="section-kicker">03 / PDF WORKBENCH</span>
          <div className="category-title-row"><h2>PDFs, without<br /><em>the paperwork.</em></h2><span className="category-number">01</span></div>
          <p>Make a document smaller, bring a stack together, pull out the pages you need, or get a scanned file ready to search.</p>
          <div className="category-tool-list">
            {["Convert PDF to Word, Excel or images", "Merge, split and rearrange pages", "Compress, rotate and add page numbers", "Annotate, sign and protect documents", "OCR scanned PDFs and extract tables"].map((item) => <div key={item}><Check size={14} /> {item}</div>)}
          </div>
          <a className="underlined-link" href="#toolkit" onClick={() => setCategory("PDF")}>Explore PDF tools <ArrowUpRight size={14} /></a>
        </div>
        <div className="pdf-visual">
          <div className="pdf-visual-header"><span>DOCUMENT / PREVIEW</span><span className="visual-status"><i /> READY TO ORGANIZE</span></div>
          <div className="pdf-stage">
            <div className="pdf-side-label"><span>PAGE 01 — 04</span><span>DRAG TO REORDER</span></div>
            <div className="pdf-page-stack">
              <div className="pdf-page page-back"><div /><div /><div /><div className="pdf-page-chart" /></div>
              <div className="pdf-page page-front"><div className="pdf-page-top"><span>CT / 2026</span><span>01</span></div><div className="pdf-page-title">Project<br />overview<span>.</span></div><div className="pdf-page-rule" /><div className="pdf-page-lines"><i /><i /><i /><i /><i /></div><div className="pdf-page-chart"><span /><span /><span /><span /></div><div className="pdf-page-footer">CONVOTOOLS / DOCUMENT STUDIO</div></div>
              <div className="pdf-page-badge"><FileText size={15} /> PDF / 4 PAGES</div>
            </div>
            <div className="pdf-thumbnails"><span className="thumbnail active"><i /><b>01</b></span><span className="thumbnail"><i /><b>02</b></span><span className="thumbnail"><i /><b>03</b></span><span className="thumbnail"><i /><b>04</b></span><button aria-label="Add page"><Plus size={15} /></button></div>
          </div>
          <div className="pdf-visual-footer"><span><Layers3 size={14} /> Page management</span><span><Minimize2 size={14} /> Compression options</span><span><ScanText size={14} /> Text recognition</span></div>
        </div>
      </motion.section>

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="category-feature image-feature section-pad" id="image-lab">
        <div className="image-visual">
          <div className="image-visual-top"><span>IMAGE LAB / ENHANCEMENT</span><span className="visual-status"><i /> EXAMPLE WORKSPACE</span></div>
          <ImageComparison />
          <div className="image-controls"><span><SlidersHorizontal size={14} /> Enhance details</span><div className="image-control-pills"><b>2×</b><b>4×</b><b>Denoise</b><b>Unblur</b></div></div>
        </div>
        <div className="category-heading">
          <span className="section-kicker">04 / IMAGE LAB</span>
          <div className="category-title-row"><h2>Give every image<br /><em>a second look.</em></h2><span className="category-number">02</span></div>
          <p>Format changes when you need them. A little restoration when you don&apos;t. Bring images into shape without opening a heavyweight editor.</p>
          <div className="category-tool-list">
            {["Convert PNG, JPG, WEBP, AVIF and more", "Resize, crop, rotate and compress", "Upscale, unblur and reduce image noise", "Remove backgrounds and create transparent PNGs", "Improve scanned photos and old images"].map((item) => <div key={item}><Check size={14} /> {item}</div>)}
          </div>
          <a className="underlined-link" href="#toolkit" onClick={() => setCategory("Images")}>Explore image tools <ArrowUpRight size={14} /></a>
        </div>
      </motion.section>

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="document-section section-pad" id="documents">
        <div className="section-topline">
          <div><span className="section-kicker">05 / DOCUMENTS & DATA</span><h2>Keep the format.<br /><em>Keep the flow.</em></h2></div>
          <p>Move between office formats and make quick changes without losing your place.</p>
        </div>
        <div className="format-workbench">
          <div className="format-panel format-word">
            <div className="format-top"><span className="format-file-icon word"><FileText size={17} /></span><span className="format-label">DOCUMENTS</span><span className="format-ext">.DOCX</span></div>
            <h3>Words into<br />workable files.</h3>
            <p>PDF to Word, Word to PDF, text extraction, quick edits and document cleanup.</p>
            <div className="doc-mini">
              <div className="doc-mini-toolbar"><i /><i /><i /><i /><i /></div>
              <div className="doc-mini-sheet"><b>Notes & ideas</b><i /><i /><i /><i className="short" /><div /></div>
            </div>
            <a href="#toolkit" onClick={() => setCategory("Documents")}>Explore document tools <ArrowUpRight size={13} /></a>
          </div>
          <div className="format-panel format-sheet">
            <div className="format-top"><span className="format-file-icon sheet"><FileSpreadsheet size={17} /></span><span className="format-label">SPREADSHEETS</span><span className="format-ext">.XLSX</span></div>
            <h3>Make data<br />less messy.</h3>
            <p>Convert workbooks, clean CSVs, combine sheets and remove duplicate rows.</p>
            <div className="sheet-mini">
              <div className="sheet-head"><span /><span>A</span><span>B</span><span>C</span><span>D</span></div>
              {["01","02","03","04"].map((n) => <div className="sheet-row" key={n}><span>{n}</span><i /><i /><i /><i /></div>)}
            </div>
            <a href="#toolkit" onClick={() => setCategory("Spreadsheets")}>Explore spreadsheet tools <ArrowUpRight size={13} /></a>
          </div>
          <div className="format-panel format-slides">
            <div className="format-top"><span className="format-file-icon slides"><PanelTop size={17} /></span><span className="format-label">PRESENTATIONS</span><span className="format-ext">.PPTX</span></div>
            <h3>Slides that<br />travel well.</h3>
            <p>Move decks to PDF, export individual slides or collect images from a presentation.</p>
            <div className="slides-mini"><div className="slide-one"><small>FIELD NOTES / 2026</small><b>Ideas into<br />action<span>.</span></b><i /></div><div className="slide-two"><i /><i /><i /></div></div>
            <a href="#toolkit" onClick={() => setCategory("Presentations")}>Explore presentation tools <ArrowUpRight size={13} /></a>
          </div>
        </div>
      </motion.section>

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="media-section section-pad" id="media">
        <div className="media-copy">
          <span className="section-kicker">06 / VIDEO & AUDIO</span>
          <h2>Make media<br /><em>more manageable.</em></h2>
          <p>Trim the extra, pull out a soundtrack, make a lightweight GIF or find a better format for the way you share.</p>
          <a className="underlined-link" href="#toolkit" onClick={() => setCategory("Video & audio")}>Explore media tools <ArrowUpRight size={14} /></a>
        </div>
        <div className="media-console">
          <div className="media-console-head"><span><Film size={14} /> MEDIA WORKBENCH</span><span>DEMO / TIMELINE</span></div>
          <div className="media-screen media-screen-real">
            <video
              className="media-demo-video"
              src="https://videos.pexels.com/video-files/34528660/14629544_2160_3840_30fps.mp4"
              poster="https://images.unsplash.com/photo-1747671688812-76d7bca21f34?auto=format&fit=crop&w=1100&q=82"
              controls
              playsInline
              preload="none"
            />
          </div>
          <div className="media-demo-credit"><a href="https://www.pexels.com/video/close-up-portrait-of-a-woman-outdoors-34528660/" target="_blank" rel="noreferrer">Video by Zulfugar Karimov / Pexels <ArrowUpRight size={11} /></a><span>Free stock footage</span></div>
          <div className="timeline-ruler"><span>00:00</span><span>00:15</span><span>00:30</span><span>00:45</span></div>
          <div className="timeline-track"><span className="track-label"><Film size={13} /> VIDEO</span><div className="track-segments"><i /><i /><i /><i /></div></div>
          <div className="timeline-track audio-track"><span className="track-label"><AudioLines size={13} /> AUDIO</span><div className="audio-wave">{Array.from({length:44}, (_, index) => <i key={index} style={{height: (8 + ((index * 17) % 23)) + "px"}} />)}</div></div>
          <div className="media-export"><span><Check size={13} /> Trim & export</span><b>MP4 <ChevronRight size={12} /> GIF <ChevronRight size={12} /> MP3</b></div>
        </div>
      </motion.section>

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="ai-section section-pad" id="ai">
        <div className="ai-top">
          <div><span className="section-kicker">07 / THE AI LAB</span><h2>When a file needs<br /><em>a little more.</em></h2></div>
          <p>The AI Lab is temporarily locked while these experiences are being prepared. Explore what is planned and see what is coming next.</p>
        </div>
        <AIGallery />
        <div className="ai-disclosure"><ShieldCheck size={15} /><span>AI access is currently locked. Model processing will be enabled only after the tools are ready for release.</span></div>
      </motion.section>

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="workflow-section section-pad" id="workflow">
        <div className="section-topline workflow-waypoint-heading">
          <div><span className="section-kicker">08 / WORKFLOWS</span><h2>One task at a time.<br /><em>Or link them up.</em></h2></div>
          <p>Follow a file through four clear waypoints. From the first upload to a finished export, every step has a purpose.</p>
        </div>
        <WorkflowWaypoints />
      </motion.section>

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="developer-section section-pad" id="developer">
        <div className="developer-copy"><span className="section-kicker">09 / DEVELOPER UTILITIES</span><h2>Little tools for<br /><em>the in-between.</em></h2><p>Not every file task needs a full editor. Keep handy utilities close by for when you need to inspect, encode or validate something quickly.</p><a className="underlined-link" href="#toolkit" onClick={() => setCategory("Developer")}>Explore developer tools <ArrowUpRight size={14} /></a></div>
        <div className="developer-console">
          <div className="developer-tabs"><span className="dev-tab-active"><Braces size={13} /> JSON</span><span><Code2 size={13} /> BASE64</span><span><LockKeyhole size={13} /> HASH</span></div>
          <div className="code-area"><div className="code-gutter">01<br />02<br />03<br />04<br />05<br />06</div><pre><span className="code-punc">{"{"}</span>{"\n"}  <span className="code-key">&quot;tool&quot;</span>: <span className="code-string">&quot;json formatter&quot;</span>,{"\n"}  <span className="code-key">&quot;status&quot;</span>: <span className="code-string">&quot;ready&quot;</span>,{"\n"}  <span className="code-key">&quot;clean&quot;</span>: <span className="code-bool">true</span>,{"\n"}  <span className="code-key">&quot;next_step&quot;</span>: <span className="code-string">&quot;your idea&quot;</span>{"\n"}<span className="code-punc">{"}"}</span></pre></div>
          <div className="developer-console-foot"><span><span className="dev-status" /> VALID JSON</span><button onClick={() => navigator.clipboard?.writeText('{"tool":"json formatter","status":"ready","clean":true,"next_step":"your idea"}')}><Copy size={13} /> Copy sample</button></div>
        </div>
      </motion.section>

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="principles-section section-pad" id="why">
        <div className="principles-heading"><span className="section-kicker">10 / THE CONVOTOOLS APPROACH</span><h2>Useful first.<br /><em>Beautiful by design.</em></h2></div>
        <div className="principles-grid">
          <article><span className="principle-num">01</span><div className="principle-icon"><ShieldCheck size={20} /></div><h3>Privacy is a product feature.</h3><p>Prefer local processing for everyday tasks. When a server or AI provider is needed, make that choice clear.</p></article>
          <article><span className="principle-num">02</span><div className="principle-icon"><Layers3 size={20} /></div><h3>Batch work is normal work.</h3><p>Handle collections of files in one go, with consistent settings and one final download.</p></article>
          <article><span className="principle-num">03</span><div className="principle-icon"><Zap size={20} /></div><h3>Fast should feel effortless.</h3><p>Keep the interface calm, the controls obvious and motion purposeful rather than distracting.</p></article>
        </div>
      </motion.section>

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="faq-section section-pad" id="faq">
        <div><span className="section-kicker">11 / GOOD TO KNOW</span><h2>A few things,<br /><em>answered.</em></h2></div>
        <div className="faq-list">
          <details><summary>Will ConvoTools be free? <span>+</span></summary><p>The goal is a free-first product without subscriptions or watermarks. Some AI providers may have their own free usage limits, and heavy server processing has real infrastructure costs.</p></details>
          <details><summary>Do my files get uploaded? <span>+</span></summary><p>The product is being designed to process files in the browser wherever practical. Some complex conversions or optional AI tools may need server-side processing or an external provider, which should be disclosed before use.</p></details>
          <details><summary>Can I process multiple files at once? <span>+</span></summary><p>Batch operations are a core part of the product direction. The workspace preview already demonstrates multi-file selection; processing will be connected tool by tool.</p></details>
          <details><summary>Are all the tools working already? <span>+</span></summary><p>This is the interface foundation. The upload interaction and tool discovery work in this preview, while conversion, editing and AI processing engines are being built in later phases.</p></details>
        </div>
      </motion.section>

      <motion.section initial={reducedMotion ? false : { opacity: 0, y: 26 }} whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }} className="final-cta section-pad">
        <div className="final-cta-card"><div className="final-cta-copy"><span className="section-kicker">A BETTER PLACE FOR FILE WORK</span><h2>Make the next file task<br /><em>the easy one.</em></h2><p>Bring a file. Pick a task. Keep moving.</p><a className="button-light" href="/dashboard">Open your workspace <ArrowUpRight size={15} /></a></div><div className="final-cta-mark"><div className="cta-mark-grid" /><div className="cta-file cta-file-one"><FileImage size={25} /></div><div className="cta-file cta-file-two"><FileText size={25} /></div><div className="cta-file cta-file-three"><FileSpreadsheet size={25} /></div><div className="cta-center"><span /><span /><span /></div></div></div>
      </motion.section>

      <FooterReveal />
    </main>
  );
}
