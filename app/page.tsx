"use client";

import {
  Activity,
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BadgeCheck,
  Blocks,
  Check,
  ChevronDown,
  Command,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType2,
  Film,
  FolderOpen,
  Github,
  Globe2,
  Image as ImageIcon,
  Layers3,
  LockKeyhole,
  Menu,
  MousePointer2,
  PanelTop,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

type Tool = {
  name: string;
  description: string;
  category: string;
  icon: typeof FileText;
  tint: string;
  popular?: boolean;
  status?: string;
};

const tools: Tool[] = [
  { name: "PDF to Word", description: "Turn PDFs into editable documents.", category: "PDF", icon: FileText, tint: "violet", popular: true },
  { name: "Image to PDF", description: "Bundle images into one clean PDF.", category: "PDF", icon: FileImage, tint: "blue", popular: true },
  { name: "Compress PDF", description: "Make PDFs smaller without the fuss.", category: "PDF", icon: Layers3, tint: "rose", popular: true },
  { name: "Merge PDF", description: "Bring multiple documents together.", category: "PDF", icon: Blocks, tint: "orange" },
  { name: "Split PDF", description: "Separate pages into individual files.", category: "PDF", icon: PanelTop, tint: "cyan" },
  { name: "PNG to JPG", description: "Switch image formats in a moment.", category: "Images", icon: ImageIcon, tint: "green", popular: true },
  { name: "Image enhancer", description: "Bring a little more clarity to photos.", category: "AI lab", icon: WandSparkles, tint: "violet", popular: true, status: "AI" },
  { name: "Background remover", description: "Make the subject the whole picture.", category: "AI lab", icon: Sparkles, tint: "pink", status: "AI" },
  { name: "Image compressor", description: "Smaller images, still looking good.", category: "Images", icon: FileImage, tint: "amber" },
  { name: "JPG to PNG", description: "Convert images with transparency support.", category: "Images", icon: FileImage, tint: "blue" },
  { name: "Word to PDF", description: "Share documents that stay in place.", category: "Documents", icon: FileType2, tint: "blue", popular: true },
  { name: "PDF to PowerPoint", description: "Turn pages into presentation slides.", category: "Documents", icon: FileText, tint: "orange" },
  { name: "Excel to PDF", description: "Create a neat, shareable spreadsheet PDF.", category: "Spreadsheets", icon: FileSpreadsheet, tint: "green" },
  { name: "CSV to XLSX", description: "Make flat data easier to work with.", category: "Spreadsheets", icon: FileSpreadsheet, tint: "emerald" },
  { name: "MP4 to GIF", description: "Clip a moment into a looping GIF.", category: "Video & audio", icon: Film, tint: "pink" },
  { name: "Extract audio", description: "Save the soundtrack from a video.", category: "Video & audio", icon: AudioLines, tint: "cyan" },
  { name: "Create ZIP", description: "Pack files into one smaller bundle.", category: "Archives", icon: FileArchive, tint: "amber" },
  { name: "OCR text", description: "Make scanned pages searchable.", category: "AI lab", icon: ScanIcon, tint: "violet", status: "AI" },
];

function ScanIcon(props: React.ComponentProps<typeof FileText>) {
  return <FileText {...props} />;
}

const categories = [
  { name: "All tools", count: "40+", icon: Blocks },
  { name: "PDF", count: "12", icon: FileText },
  { name: "Images", count: "10", icon: ImageIcon },
  { name: "Documents", count: "8", icon: FileType2 },
  { name: "Spreadsheets", count: "6", icon: FileSpreadsheet },
  { name: "Video & audio", count: "8", icon: Film },
  { name: "AI lab", count: "6", icon: WandSparkles },
  { name: "Archives", count: "4", icon: FileArchive },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  const reducedMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState("All tools");
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const accepted = Array.from(incoming).filter((file) => file.size > 0);
    setFiles((current) => [...current, ...accepted].slice(0, 30));
  }, []);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const filteredTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const categoryMatch =
        activeCategory === "All tools" || tool.category === activeCategory;
      const queryMatch =
        !normalized ||
        `${tool.name} ${tool.description} ${tool.category}`
          .toLowerCase()
          .includes(normalized);
      return categoryMatch && queryMatch;
    });
  }, [activeCategory, query]);

  const visibleTools = showAll ? filteredTools : filteredTools.slice(0, 8);

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.16 },
        transition: { duration: 0.7, ease },
      };

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#" aria-label="ConvoTools home">
          <span className="brand-mark"><Command size={19} strokeWidth={2.4} /></span>
          <span>convo<span className="brand-light">tools</span><i>.</i></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a className="nav-active" href="#tools">Tools</a>
          <a href="#workspace">Workspace</a>
          <a href="#why">Why ConvoTools</a>
        </nav>
        <div className="nav-actions">
          <a className="github-link" href="https://github.com/RAJ-SUHANDANI/ConvoTools" target="_blank" rel="noreferrer"><Github size={16} /> <span>GitHub</span></a>
          <a className="nav-cta" href="#workspace">Try it free <ArrowUpRight size={15} /></a>
          <button className="mobile-menu" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">{mobileOpen ? <X /> : <Menu />}</button>
        </div>
      </header>
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav className="mobile-nav" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <a href="#tools" onClick={() => setMobileOpen(false)}>Tools</a>
            <a href="#workspace" onClick={() => setMobileOpen(false)}>Workspace</a>
            <a href="#why" onClick={() => setMobileOpen(false)}>Why ConvoTools</a>
          </motion.nav>
        )}
      </AnimatePresence>

      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-copy">
          <motion.div className="announcement" {...(reducedMotion ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1, duration: 0.6 } })}>
            <span className="announcement-dot" /> YOUR FILE TOOLKIT, REIMAGINED <ArrowUpRight size={13} />
          </motion.div>
          <motion.h1 {...(reducedMotion ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.18, duration: 0.8, ease } })}>
            Files, meet your<br /><span className="headline-gradient">better workflow.</span>
          </motion.h1>
          <motion.p className="hero-subtitle" {...(reducedMotion ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3, duration: 0.7, ease } })}>
            Convert, edit, compress and enhance. All the tools your files need, in one thoughtful workspace.
          </motion.p>
          <motion.div className="hero-actions" {...(reducedMotion ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.42, duration: 0.7, ease } })}>
            <a className="primary-button" href="#workspace">Explore the workspace <ArrowRight size={17} /></a>
            <a className="text-button" href="#tools">Browse all tools <ArrowDown size={15} /></a>
          </motion.div>
          <motion.div className="hero-proof" {...(reducedMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.65, duration: 0.7 } })}>
            <div className="proof-avatars"><span>PDF</span><span>IMG</span><span>DOC</span><span>ZIP</span></div>
            <p><strong>One home for every format.</strong><br />No accounts. No watermarks. No fuss.</p>
          </motion.div>
        </div>

        <motion.div className="hero-art" initial={reducedMotion ? false : { opacity: 0, scale: 0.88, rotate: 3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.1, delay: 0.25, ease }}>
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <motion.div className="float-chip chip-top" animate={reducedMotion ? {} : { y: [0, -9, 0], rotate: [0, 2, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            <span className="chip-icon purple"><FileText size={18} /></span><span><b>PDF</b><small>Ready to edit</small></span><BadgeCheck size={16} className="chip-check" />
          </motion.div>
          <motion.div className="float-chip chip-side" animate={reducedMotion ? {} : { y: [0, 10, 0], rotate: [0, -2, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}>
            <span className="chip-icon blue"><ImageIcon size={18} /></span><span><b>Image</b><small>2.4 MB · PNG</small></span>
          </motion.div>
          <div className="glass-core">
            <div className="core-glow" />
            <div className="core-inner">
              <div className="core-icon"><Command size={48} strokeWidth={1.5} /></div>
              <div className="core-wordmark">convo<span>tools</span></div>
              <div className="core-caption">EVERY FILE. ONE WORKSPACE.</div>
            </div>
            <div className="core-ring ring-a" /><div className="core-ring ring-b" />
            <div className="core-spark spark-a">✳</div><div className="core-spark spark-b">✦</div>
          </div>
          <motion.div className="float-chip chip-bottom" animate={reducedMotion ? {} : { y: [0, -7, 0], rotate: [0, 1, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>
            <span className="chip-icon green"><FileSpreadsheet size={18} /></span><span><b>XLSX</b><small>Converted in 1.2s</small></span><span className="tiny-check"><Check size={11} /></span>
          </motion.div>
          <div className="art-caption"><span className="caption-line" /> DESIGNED FOR THE WAY YOU WORK</div>
        </motion.div>
        <div className="hero-bottom-note"><span>SCROLL TO EXPLORE</span><motion.div animate={reducedMotion ? {} : { y: [0, 5, 0] }} transition={{ duration: 1.6, repeat: Infinity }}><ArrowDown size={14} /></motion.div></div>
      </section>

      <section className="trust-strip" aria-label="Product benefits">
        <span><ShieldCheck size={15} /> Privacy-first by design</span>
        <i />
        <span><Zap size={15} /> Fast, simple workflows</span>
        <i />
        <span><Globe2 size={15} /> Works right in your browser</span>
        <i />
        <span><LockKeyhole size={15} /> Free to use</span>
      </section>

      <section className="workspace-section section-wrap" id="workspace">
        <motion.div className="section-heading" {...motionProps}>
          <div>
            <div className="eyebrow"><span /> THE WORKSPACE</div>
            <h2>Drop in. Get things <span>done.</span></h2>
            <p>Your next file task starts here. Drop a file, or choose one from your device.</p>
          </div>
          <div className="workspace-shortcut"><Command size={13} /> <span>Simple by design</span></div>
        </motion.div>
        <motion.div className={`upload-panel ${dragging ? "is-dragging" : ""}`} {...motionProps} onDragEnter={(e) => { e.preventDefault(); setDragging(true); }} onDragOver={(e) => e.preventDefault()} onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }} onDrop={onDrop}>
          <input ref={inputRef} type="file" multiple className="hidden-input" onChange={onInputChange} />
          <div className="upload-decoration decoration-left"><FileImage size={24} /><span>PNG</span></div>
          <div className="upload-decoration decoration-right"><FileText size={24} /><span>PDF</span></div>
          <div className="upload-main">
            <motion.div className="upload-icon" animate={reducedMotion ? {} : { y: [0, -5, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}><UploadCloud size={30} strokeWidth={1.6} /></motion.div>
            <h3>{dragging ? "Drop it like it's hot." : "What are we working on?"}</h3>
            <p>Drag and drop your files here, or <button className="inline-link" onClick={() => inputRef.current?.click()}>browse files</button></p>
            <button className="choose-button" onClick={() => inputRef.current?.click()}><Plus size={16} /> Choose files <ArrowUpRight size={14} /></button>
            <div className="upload-meta"><span><Check size={12} /> Multiple files</span><span><Check size={12} /> Up to 30 files in preview</span><span><Check size={12} /> Any common format</span></div>
          </div>
          <div className="upload-bottom"><span><LockKeyhole size={12} /> Files stay in this demo session</span><span>PDF · DOCX · XLSX · PNG · JPG · MP4 · ZIP</span></div>
        </motion.div>
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div className="file-queue" initial={{ opacity: 0, y: 12, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }}>
              <div className="queue-heading"><div><span className="eyebrow">YOUR FILES</span><h3>{files.length} file{files.length === 1 ? "" : "s"} added</h3></div><button className="clear-button" onClick={() => setFiles([])}>Clear all <X size={13} /></button></div>
              <div className="queue-list">
                {files.map((file, index) => (
                  <div className="queue-file" key={`${file.name}-${index}`}>
                    <div className="queue-file-icon"><FileType2 size={18} /></div>
                    <div className="queue-file-name"><strong>{file.name}</strong><small>{formatBytes(file.size)} · {file.type || "Unknown type"}</small></div>
                    <span className="detected-tag"><Check size={12} /> Added</span>
                    <button aria-label={`Remove ${file.name}`} className="remove-file" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}><X size={15} /></button>
                  </div>
                ))}
              </div>
              <div className="queue-foot"><span>Upload UI preview · processing engine is next</span><span className="queue-hint">Your files aren't sent to a server.</span></div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="tools-section section-wrap" id="tools">
        <motion.div className="section-heading tools-heading" {...motionProps}>
          <div>
            <div className="eyebrow"><span /> THE TOOLKIT</div>
            <h2>Small tasks. <span>Big relief.</span></h2>
            <p>Everything you need to keep your files moving. Find your tool and get on with it.</p>
          </div>
          <div className="tool-count"><strong>40+</strong><span>tools planned<br />and growing</span></div>
        </motion.div>
        <div className="tool-browser">
          <div className="tool-topline">
            <div className="category-tabs">
              {categories.map((category) => {
                const Icon = category.icon;
                return <button key={category.name} className={activeCategory === category.name ? "category-tab active" : "category-tab"} onClick={() => { setActiveCategory(category.name); setShowAll(false); }}><Icon size={14} /><span>{category.name}</span><small>{category.count}</small></button>;
              })}
            </div>
            <label className="tool-search"><Search size={16} /><input value={query} onChange={(e) => { setQuery(e.target.value); setShowAll(true); }} placeholder="Find a tool..." /><kbd>/</kbd></label>
          </div>
          <div className="tool-grid">
            <AnimatePresence mode="popLayout">
              {visibleTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <motion.button layout key={tool.name} className="tool-card" initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35, delay: index * 0.025, ease }}>
                    <div className={`tool-icon ${tool.tint}`}><Icon size={19} strokeWidth={1.8} /></div>
                    <div className="tool-card-copy"><div className="tool-title-line"><h3>{tool.name}</h3>{tool.status && <span className="ai-tag">{tool.status}</span>}</div><p>{tool.description}</p></div>
                    <span className="tool-arrow"><ArrowUpRight size={15} /></span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
            {visibleTools.length === 0 && <div className="empty-tools"><Search size={22} /><strong>No tools found</strong><span>Try another search or category.</span></div>}
          </div>
          {filteredTools.length > 8 && (
            <button className="view-all-button" onClick={() => setShowAll((v) => !v)}>{showAll ? "Show less" : `Explore all ${filteredTools.length} tools`} <ArrowRight size={15} /></button>
          )}
        </div>
      </section>

      <section className="feature-section section-wrap" id="why">
        <motion.div className="feature-intro" {...motionProps}>
          <div className="eyebrow"><span /> A BETTER KIND OF TOOLBOX</div>
          <h2>Less tab-hopping.<br /><span>More making.</span></h2>
          <p>ConvoTools brings the little file jobs into one calm, capable place. No scavenger hunt for the right website.</p>
          <a className="text-button" href="#workspace">Give it a spin <ArrowUpRight size={15} /></a>
        </motion.div>
        <div className="feature-cards">
          <motion.article className="feature-card feature-card-large" {...motionProps}>
            <div className="feature-card-top"><span className="feature-symbol violet"><MousePointer2 size={18} /></span><span className="feature-index">01 / SIMPLE</span></div>
            <div className="mini-window">
              <div className="mini-window-bar"><i /><i /><i /><span>convo.tools / workspace</span></div>
              <div className="mini-window-body"><div className="mini-sidebar"><b /><i /><i /><i /><i /></div><div className="mini-content"><div className="mini-title" /><div className="mini-drop"><UploadCloud size={18} /><span>Drop your file here</span></div><div className="mini-actions"><i /><i /><i /></div></div></div>
            </div>
            <h3>One home for file jobs.</h3><p>One upload experience, one clean workspace, and the right next step without the extra clicks.</p>
          </motion.article>
          <motion.article className="feature-card" {...motionProps}>
            <div className="feature-card-top"><span className="feature-symbol blue"><Zap size={18} /></span><span className="feature-index">02 / QUICK</span></div>
            <div className="speed-visual"><div className="speed-ring"><Zap size={30} /><span>FAST</span></div><div className="speed-orbit" /></div>
            <h3>Out of your way.</h3><p>Thoughtful flows that help you get in, get it done, and get back to what matters.</p>
          </motion.article>
          <motion.article className="feature-card" {...motionProps}>
            <div className="feature-card-top"><span className="feature-symbol green"><LockKeyhole size={18} /></span><span className="feature-index">03 / PRIVATE</span></div>
            <div className="privacy-visual"><div className="privacy-shield"><ShieldCheck size={38} /></div><span className="privacy-pill"><Check size={11} /> Local-first direction</span></div>
            <h3>Your files, your business.</h3><p>Browser-based processing wherever practical. Clear choices when a task needs a server.</p>
          </motion.article>
        </div>
      </section>

      <section className="closing-section section-wrap">
        <motion.div className="closing-card" {...motionProps}>
          <div className="closing-glow" />
          <div className="closing-copy"><div className="eyebrow"><span /> READY WHEN YOU ARE</div><h2>Make file work<br /><span>feel less like work.</span></h2><p>Your next conversion is a drag and drop away.</p><a href="#workspace" className="primary-button">Open the workspace <ArrowUpRight size={16} /></a></div>
          <div className="closing-art"><div className="closing-orbit orbit-x" /><div className="closing-orbit orbit-y" /><div className="closing-doc doc-a"><FileText size={27} /></div><div className="closing-doc doc-b"><ImageIcon size={27} /></div><div className="closing-doc doc-c"><FileSpreadsheet size={27} /></div><div className="closing-center"><Command size={42} /></div><Sparkles className="closing-spark" size={22} /></div>
        </motion.div>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="#"><span className="brand-mark"><Command size={17} /></span><span>convo<span className="brand-light">tools</span><i>.</i></span></a>
        <span>Thoughtful tools for all your files.</span>
        <div className="footer-links"><a href="#tools">Explore tools</a><a href="#workspace">Workspace</a><a href="https://github.com/RAJ-SUHANDANI/ConvoTools" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={12} /></a></div>
        <small>© 2026 ConvoTools. Made for the love of getting things done.</small>
      </footer>
    </main>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
