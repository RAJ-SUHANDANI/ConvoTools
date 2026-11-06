"use client";

import { useEffect, useRef, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import {
  ArrowRight, ArrowUpRight,
  Github, Image as ImageIcon,
  LockKeyhole, Menu, ScanText, Sparkles, WandSparkles,
  Workflow, X
} from "lucide-react";
import {
  AnimatePresence, motion, useReducedMotion, useScroll, useTransform,
} from "motion/react";

const navigation = [
  { label: "Tools", href: "#toolkit", eyebrow: "THE TOOL LIBRARY", groups: [
    { title: "WORK WITH FILES", items: [["All tools", "#toolkit"], ["PDF workbench", "#pdf"], ["Documents & data", "#documents"]] },
    { title: "CREATE & REFINE", items: [["Image lab", "#image-lab"], ["Video & audio", "#media"], ["Developer utilities", "#developer"]] },
  ]},
  { label: "PDF", href: "#pdf", eyebrow: "DOCUMENT WORKFLOWS", groups: [
    { title: "PDF WORKBENCH", items: [["Merge & organize", "#pdf"], ["Compress & protect", "#pdf"], ["Convert documents", "#documents"]] },
    { title: "QUICK START", items: [["Start with a file", "/dashboard"], ["Browse all PDF tools", "#toolkit"]] },
  ]},
  { label: "Image lab", href: "#image-lab", eyebrow: "IMAGE WORKFLOWS", groups: [
    { title: "IMAGE TOOLS", items: [["Convert & resize", "#image-lab"], ["Restore & enhance", "#ai"], ["Remove backgrounds", "#ai"]] },
    { title: "QUICK START", items: [["Open your workspace", "/dashboard"], ["Browse image tools", "#toolkit"]] },
  ]},
  { label: "Workflows", href: "#workflow", eyebrow: "REPEATABLE FILE WORK", groups: [
    { title: "WORKFLOW STUDIO", items: [["See the workflow map", "#workflow"], ["Start with a file", "/dashboard"]] },
    { title: "MORE TO EXPLORE", items: [["Developer utilities", "#developer"], ["Frequently asked questions", "#faq"]] },
  ]},
  { label: "About", href: "#why", eyebrow: "THE CONVOTOOLS APPROACH", groups: [
    { title: "OUR PRINCIPLES", items: [["Privacy by default", "#why"], ["How it works", "#faq"]] },
    { title: "THE PROJECT", items: [["GitHub", "https://github.com/RAJ-SUHANDANI/ConvoTools"], ["Open workspace", "/dashboard"]] },
  ]},
] as const;

export function LandingNav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const active = navigation.find((item) => item.label === activeMenu);

  return (
    <div className="landing-nav-shell" onMouseLeave={() => setActiveMenu(null)}>
      <header className="site-header">
        <BrandLogo className="brand-header" width={205} priority />
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button key={item.label} className={activeMenu === item.label ? "mega-nav-trigger active" : "mega-nav-trigger"}
              onMouseEnter={() => setActiveMenu(item.label)} onFocus={() => setActiveMenu(item.label)}
              onClick={() => setActiveMenu(activeMenu === item.label ? null : item.label)} aria-expanded={activeMenu === item.label}>
              {item.label}
              {activeMenu === item.label && <motion.span layoutId="convotools-nav-indicator" className="mega-nav-indicator" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-github" href="https://github.com/RAJ-SUHANDANI/ConvoTools" target="_blank" rel="noreferrer"><Github size={15} /> <span>GitHub</span></a>
          <a className="header-button" href="/dashboard">Open workspace <ArrowUpRight size={14} /></a>
          <button className="mobile-toggle" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={mobileOpen}>{mobileOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </header>
      <AnimatePresence>
        {active && !mobileOpen && (
          <motion.div className="mega-menu-panel" initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -9, scale: .985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .99 }}
            transition={{ duration: .2, ease: [0.22, 1, 0.36, 1] }} onMouseEnter={() => setActiveMenu(active.label)}>
            <div className="mega-menu-intro"><span className="section-kicker">CONVOTOOLS / NAVIGATION</span><h3>{active.eyebrow}</h3><p>One considered place for the file work that keeps moving.</p><a href={active.href}>Explore {active.label.toLowerCase()} <ArrowUpRight size={13} /></a></div>
            {active.groups.map((group) => <div className="mega-menu-group" key={group.title}><span>{group.title}</span>{group.items.map(([label, href]) => <a key={label} href={href} onClick={() => setActiveMenu(null)}>{label}<ArrowUpRight size={12} /></a>)}</div>)}
            <div className="mega-menu-stamp"><span>CT</span><small>ONE WORKSPACE<br/>LESS BUSYWORK</small></div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav className="mobile-nav mega-mobile-nav" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} aria-label="Mobile navigation">
            {navigation.map((item) => <a key={item.label} href={item.href} onClick={() => setMobileOpen(false)}>{item.label}<ArrowUpRight size={13} /></a>)}
            <a href="/dashboard" onClick={() => setMobileOpen(false)}>Open workspace<ArrowUpRight size={13} /></a>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

const typewriterPhrases = ["work for you.", "move with you.", "fit your flow."];

export function TypewriterHeading() {
  const reducedMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(typewriterPhrases[0]);

  useEffect(() => {
    if (reducedMotion) return;
    let index = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const phrase = typewriterPhrases[phraseIndex];
      if (!deleting) {
        index += 1;
        setVisible(phrase.slice(0, index));
        if (index >= phrase.length) {
          deleting = true;
          timer = setTimeout(tick, 1900);
          return;
        }
        timer = setTimeout(tick, 86);
      } else {
        index -= 1;
        setVisible(phrase.slice(0, Math.max(0, index)));
        if (index <= 0) {
          deleting = false;
          setPhraseIndex((current) => (current + 1) % typewriterPhrases.length);
          return;
        }
        timer = setTimeout(tick, 38);
      }
    };
    timer = setTimeout(tick, 1600);
    return () => clearTimeout(timer);
  }, [phraseIndex, reducedMotion]);

  return <h1>Make files<br /><em className="hero-typewriter" aria-label={visible}>{reducedMotion ? typewriterPhrases[0] : visible}<i aria-hidden="true" /></em></h1>;
}

export function ScrollTextLines() {
  const first = ["LESS BUSYWORK.", "MORE ROOM FOR GOOD WORK.", "FILE WORK, IN FLOW."];
  const second = ["CONVERT.", "REFINE.", "ORGANIZE.", "GET BACK TO IT."];
  const renderGroup = (items: string[]) => items.map((item, index) => <span className="scroll-marquee-item" key={item}><b>{item}</b><i /> <small>CT / 0{index + 1}</small></span>);
  return <div className="scroll-text-lines" aria-label="Less busywork. More room for good work.">
    <div className="scroll-text-heading"><span>THE CONVOTOOLS RHYTHM</span><small>LESS CLICKING. MORE DOING.</small></div>
    <div className="scroll-marquee-window">
      <div className="scroll-marquee-track scroll-marquee-track-one">
        <div className="scroll-marquee-group">{renderGroup(first)}</div>
        <div className="scroll-marquee-group" aria-hidden="true">{renderGroup(first)}</div>
      </div>
      <div className="scroll-marquee-track scroll-marquee-track-two">
        <div className="scroll-marquee-group">{renderGroup(second)}</div>
        <div className="scroll-marquee-group" aria-hidden="true">{renderGroup(second)}</div>
      </div>
    </div>
  </div>;
}

const workflowSteps = [
  { number: "01", label: "DROP", title: "Start with anything.", copy: "Bring a single file or a whole batch. Your workspace reads the format and gets it ready.", meta: "INPUT / FILE DETECTION", x: "8%", y: "13%" },
  { number: "02", label: "CHOOSE", title: "Find the next move.", copy: "Relevant actions surface around your file, so the right conversion or edit is one clear choice away.", meta: "ROUTE / ACTION MATCHING", x: "53%", y: "32%" },
  { number: "03", label: "REFINE", title: "Make it yours.", copy: "Tune the settings, review the result and keep the work local wherever practical.", meta: "TRANSFORM / PROCESSING", x: "15%", y: "59%" },
  { number: "04", label: "TAKE IT", title: "Keep things moving.", copy: "Your finished files are ready to download, with the original left untouched.", meta: "OUTPUT / EXPORT", x: "62%", y: "76%" },
];

export function WorkflowWaypoints() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const pathLength = useTransform(scrollYProgress, [0, .82], [0, 1]);
  return <div className="workflow-waypoint-stage" ref={ref}>
    <div className="waypoint-stage-top"><span><Workflow size={14} /> THE FILE JOURNEY / 04 WAYPOINTS</span><span>SCROLL TO TRACE THE FLOW <ArrowRight size={13} /></span></div>
    <div className="waypoint-map">
      <svg className="waypoint-path" viewBox="0 0 1000 470" preserveAspectRatio="none" aria-hidden="true">
        <path className="waypoint-path-base" d="M115 72 C330 5 455 145 620 163 S825 250 698 316 S380 390 610 430 S825 410 895 430" />
        <motion.path className="waypoint-path-progress" d="M115 72 C330 5 455 145 620 163 S825 250 698 316 S380 390 610 430 S825 410 895 430" style={{ pathLength }} />
      </svg>
      {workflowSteps.map((step, index) => <motion.article key={step.number} className={"waypoint-card waypoint-card-" + index}
        style={{ left: step.x, top: step.y }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }}
        transition={{ duration: .55, delay: index * .08 }}>
        <div className="waypoint-card-head"><span>{step.number} / {step.label}</span><b>{step.meta}</b></div>
        <h3>{step.title}</h3><p>{step.copy}</p><span className="waypoint-card-dot" />
      </motion.article>)}
      <div className="waypoint-orbit waypoint-orbit-one" /><div className="waypoint-orbit waypoint-orbit-two" />
      <div className="waypoint-map-mark">CONVOTOOLS <i /> FILE SYSTEM / 2026</div>
    </div>
    <div className="waypoint-stage-bottom"><span>ONE FILE. A CLEAR NEXT STEP.</span><span>LOCAL-FIRST WHEREVER PRACTICAL <LockKeyhole size={12} /></span></div>
  </div>;
}

const aiFeatures = [
  { id: "enhance", number: "01", category: "RESTORE / COMING SOON", title: "Restore the detail.", description: "Upscale, sharpen and reduce noise in photos that need a second chance.", tags: ["2× UPSCALE", "DENOISE", "UNBLUR"], icon: WandSparkles, art: "enhance" },
  { id: "background", number: "02", category: "ISOLATE / COMING SOON", title: "Keep what matters.", description: "Remove backgrounds and export clean transparent assets, ready for the next design.", tags: ["BACKGROUND", "TRANSPARENT PNG", "OBJECT"], icon: ImageIcon, art: "background" },
  { id: "ocr", number: "03", category: "EXTRACT / COMING SOON", title: "Find the words inside.", description: "Turn scans and screenshots into text you can search, edit and use.", tags: ["OCR", "TABLES", "SCANNED PDF"], icon: ScanText, art: "ocr" },
  { id: "restore", number: "04", category: "REPAIR / COMING SOON", title: "Bring old images back.", description: "Give low-resolution and damaged-looking photographs a cleaner, clearer finish.", tags: ["PHOTO RESTORE", "DETAILS", "CLARITY"], icon: Sparkles, art: "restore" },
];

export function AIGallery() {
  const [activeId, setActiveId] = useState(aiFeatures[0].id);
  const active = aiFeatures.find((item) => item.id === activeId) || aiFeatures[0];
  const ActiveIcon = active.icon;
  return <div className="ai-presence-gallery">
    <div className="ai-gallery-selector">
      <span className="micro-label">SELECT AN EXPERIENCE</span>
      {aiFeatures.map((item) => {
        const Icon = item.icon;
        return <motion.button key={item.id} layout className={active.id === item.id ? "ai-gallery-option active" : "ai-gallery-option"} onClick={() => setActiveId(item.id)} whileHover={{ x: 4 }} whileTap={{ scale: .985 }}>
          <span className="ai-gallery-option-icon"><Icon size={16} /></span><span><small>{item.number} / {item.category}</small><b>{item.title}</b></span><ArrowUpRight size={14} />
          {active.id === item.id && <motion.i layoutId="ai-gallery-option-indicator" />}
        </motion.button>;
      })}
    </div>
    <div className="ai-gallery-feature">
      <AnimatePresence mode="wait">
        <motion.article key={active.id} className="ai-gallery-feature-card" initial={{ opacity: 0, y: 16, filter: "blur(7px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -12, filter: "blur(5px)" }} transition={{ duration: .35, ease: [0.22, 1, 0.36, 1] }}>
          <div className="ai-gallery-feature-top"><span>{active.number} / AI LAB EXPERIENCE</span><span className="ai-coming-pill"><i /> COMING SOON</span></div>
          <div className={"ai-gallery-art ai-art-" + active.art}>
            <div className="ai-art-orbit ai-art-orbit-a" /><div className="ai-art-orbit ai-art-orbit-b" />
            <div className="ai-art-core"><ActiveIcon size={42} strokeWidth={1.15} /></div>
            <div className="ai-art-float ai-art-float-a">AI / 0{active.number}</div><div className="ai-art-float ai-art-float-b">MODEL OFFLINE</div>
            <div className="ai-art-scan" />
          </div>
          <div className="ai-gallery-feature-copy"><div><span className="section-kicker">{active.category}</span><h3>{active.title}</h3><p>{active.description}</p></div><div className="ai-gallery-tags">{active.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
        </motion.article>
      </AnimatePresence>
    </div>
  </div>;
}

export function AmbientCursor() {
  const reducedMotion = useReducedMotion();
  const cursorRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (cursorRef.current) {
        cursorRef.current.style.left = event.clientX + "px";
        cursorRef.current.style.top = event.clientY + "px";
      }
      setVisible(true);
      const target = event.target;
      setInteractive(target instanceof Element && Boolean(target.closest("a,button,[role='button'],input,select,textarea")));
    };
    const leave = () => setVisible(false);
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    return () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); };
  }, [reducedMotion]);

  if (!enabled || reducedMotion) return null;
  return <motion.div ref={cursorRef} className={"ambient-cursor" + (visible ? " is-visible" : "") + (interactive ? " is-interactive" : "")} initial={false} animate={{ scale: interactive ? 1.45 : 1, opacity: visible ? 1 : 0 }} transition={{ type: "spring", stiffness: 420, damping: 30 }} aria-hidden="true"><i /><b /></motion.div>;
}


export function FooterReveal() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], [52, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [.965, 1]);
  const opacity = useTransform(scrollYProgress, [0, .78, 1], [.35, .82, 1]);
  return <motion.footer ref={ref} className="site-footer" style={{ y, scale, opacity }}>
    <div className="footer-ambient-word" aria-hidden="true">CT</div>
    <div className="footer-prelude">
      <span className="footer-kicker"><i /> YOUR NEXT FILE STARTS HERE</span>
      <h2>Less time moving files.<br/><em>More time moving forward.</em></h2>
      <a className="footer-cta" href="/dashboard">Open your workspace <ArrowUpRight size={15}/></a>
    </div>
    <div className="footer-main">
      <div className="footer-brand-column">
        <BrandLogo className="brand-footer" width={190}/>
        <p>A more considered way to get<br/>the everyday file jobs done.</p>
        <div className="footer-status"><span/> BROWSER-FIRST WORKSPACE <i/> BUILT TO KEEP YOU MOVING</div>
      </div>
      <div className="footer-nav">
        <div><b>EXPLORE</b><a href="#toolkit">All tools</a><a href="#pdf">PDF workbench</a><a href="#image-lab">Image lab</a><a href="#ai">AI lab</a></div>
        <div><b>WORKSPACE</b><a href="/dashboard">Dashboard</a><a href="#workflow">Workflows</a><a href="#developer">Developer utilities</a><a href="#faq">FAQ</a></div>
        <div><b>THE PROJECT</b><a href="https://github.com/RAJ-SUHANDANI/ConvoTools" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={12}/></a><a href="#why">Our approach</a></div>
      </div>
    </div>
    <div className="footer-bottom"><span>© 2026 CONVOTOOLS. MADE FOR THE WORK BETWEEN THE WORK.</span><span>LOCAL-FIRST FILE WORKSPACE <i/> 42 TOOLS · BROWSER PROCESSING</span><a href="#top">BACK TO TOP ↑</a></div>
  </motion.footer>;
}


const approachSteps = [
  { number: "01", label: "PRIVACY", title: "Privacy is a product feature.", copy: "Everyday tools should work locally wherever practical, and make outside processing clear when it is needed.", meta: "TRUST / TRANSPARENCY", x: "5%", y: "14%" },
  { number: "02", label: "BATCH WORK", title: "Collections are normal.", copy: "Work with multiple files in one place, using consistent settings and a clean final output.", meta: "FLOW / CONSISTENCY", x: "37%", y: "51%" },
  { number: "03", label: "CLARITY", title: "Fast should feel effortless.", copy: "Keep the interface calm, the controls obvious and every animation useful rather than distracting.", meta: "CRAFT / PURPOSEFUL MOTION", x: "69%", y: "15%" },
];

export function ApproachWaypoints() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const pathLength = useTransform(scrollYProgress, [0, .84], [0, 1]);
  const path = "M125 95 C260 30 325 230 465 260 S695 45 850 105";
  return <div className="workflow-waypoint-stage approach-waypoint-stage" ref={ref}>
    <div className="waypoint-stage-top"><span><Sparkles size={14} /> THE PRINCIPLES / 03 WAYPOINTS</span><span>SCROLL TO EXPLORE <ArrowRight size={13} /></span></div>
    <div className="waypoint-map approach-waypoint-map">
      <svg className="waypoint-path" viewBox="0 0 1000 390" preserveAspectRatio="none" aria-hidden="true">
        <path className="waypoint-path-base" d={path} />
        <motion.path className="waypoint-path-progress" d={path} style={{ pathLength }} />
      </svg>
      {approachSteps.map((step, index) => <motion.article key={step.number} className={"waypoint-card approach-waypoint-card approach-waypoint-card-" + index}
        style={{ left: step.x, top: step.y }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }}
        transition={{ duration: .55, delay: index * .08 }}>
        <div className="waypoint-card-head"><span>{step.number} / {step.label}</span><b>{step.meta}</b></div>
        <h3>{step.title}</h3><p>{step.copy}</p><span className="waypoint-card-dot" />
      </motion.article>)}
      <div className="waypoint-orbit waypoint-orbit-one" /><div className="waypoint-orbit waypoint-orbit-two" />
      <div className="waypoint-map-mark">CONVOTOOLS <i /> PRINCIPLES / 2026</div>
    </div>
    <div className="waypoint-stage-bottom"><span>USEFUL FIRST. BEAUTIFUL BY DESIGN.</span><span>TRUST · CLARITY · CRAFT <Sparkles size={12} /></span></div>
  </div>;
}


const liveCodeLines = [
  "const workspace = {",
  '  privacy: "local-first",',
  "  batch: true,",
  "};",
  "",
  "async function prepareFile(file: File) {",
  "  const format = detectFormat(file);",
  "  const actions = getActionsForFile(file);",
  "  return actions.map((action) => ({",
  "    ...action,",
  "    ready: true,",
  "  }));",
  "}",
  "",
  "await workspace.ready();",
];

function highlightLiveCode(line: string) {
  const parts = line.split(/("[^"]*"|'[^']*'|\b(?:const|async|function|return|await|true|false)\b|\b[A-Z][A-Za-z0-9_]*\b|=>|[{}().,:;])/g);
  return parts.map((part, index) => {
    let className = "";
    if (/^("|')/.test(part)) className = "terminal-token-string";
    else if (/^(const|async|function|return|await|true|false)$/.test(part)) className = "terminal-token-keyword";
    else if (/^[A-Z][A-Za-z0-9_]*$/.test(part)) className = "terminal-token-type";
    else if (/^(=>|[{}().,:;])$/.test(part)) className = "terminal-token-punct";
    return className ? <span className={className} key={index}>{part}</span> : part;
  });
}

export function LiveCodeTerminal() {
  const reducedMotion = useReducedMotion();
  const totalCharacters = liveCodeLines.reduce((sum, line) => sum + line.length + 1, 0);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setFrame(totalCharacters + 30);
      return;
    }
    const interval = window.setInterval(() => {
      setFrame((current) => current >= totalCharacters + 46 ? 0 : current + 1);
    }, 36);
    return () => window.clearInterval(interval);
  }, [reducedMotion, totalCharacters]);

  let remaining = Math.min(frame, totalCharacters);
  const rows = liveCodeLines.map((line, index) => {
    if (remaining > line.length) {
      remaining -= line.length + 1;
      return { line, visible: line, active: false, index };
    }
    if (remaining >= 0) {
      const visible = line.slice(0, remaining);
      remaining = -1;
      return { line, visible, active: true, index };
    }
    return { line, visible: "", active: false, index };
  });

  return <div className="live-code-editor" aria-label="Animated TypeScript code preview">
    <div className="live-code-toolbar"><span className="live-code-file"><i /> src / workspace.ts</span><span className="live-code-language">TYPESCRIPT</span><span className="live-code-run"><i /> LIVE PREVIEW</span></div>
    <div className="live-code-body">
      <div className="live-code-gutter">{rows.map((row) => <span key={row.index}>{String(row.index + 1).padStart(2, "0")}</span>)}</div>
      <pre className="live-code-source">{rows.map((row) => <span className={row.active ? "live-code-line active" : "live-code-line"} key={row.index}>{highlightLiveCode(row.visible)}{row.active && <i className="live-code-caret" />}</span>)}</pre>
    </div>
    <div className="live-code-status"><span><i /> CODE STREAM ACTIVE</span><span>UTF-8 <b>·</b> SPACES: 2 <b>·</b> TS</span></div>
  </div>;
}
