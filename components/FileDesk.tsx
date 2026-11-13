"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  Github,
  Layers2,
  LockKeyhole,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { HeroStage, ConversionMotion } from "@/components/StudioMotion";
import { Upload as MotionUpload } from "@/components/animate-ui/icons/upload";
import { ArrowRight as MotionArrow } from "@/components/animate-ui/icons/arrow-right";
import { RollingText } from "@animate-ui/react/primitives/texts/rolling";
import { FileCheck } from "@/components/animate-ui/icons/file-check";
import { Button } from "@animate-ui/react/primitives/buttons/button";
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number";
import { Fade } from "@animate-ui/react/primitives/effects/fade";
import { SlidingText } from "@animate-ui/react/primitives/texts/sliding";
import ProductStory from "@/components/ProductStory";
import FileActionPanel from "@/components/FileActionPanel";
import { recordActivity } from "@/lib/activity";
import { TOOLS, TOOL_CATEGORIES, slugify } from "@/lib/tools";

const samples = [
  {
    from: "PDF",
    to: "DOCX",
    name: "Project brief",
    caption: "Give a finished document a fresh start.",
    tool: "PDF to Word",
    color: "violet",
  },
  {
    from: "PNG",
    to: "JPG",
    name: "Cover image",
    caption: "The right format for its next destination.",
    tool: "PNG to JPG",
    color: "peach",
  },
  {
    from: "CSV",
    to: "XLSX",
    name: "Project data",
    caption: "From raw rows to a workable spreadsheet.",
    tool: "CSV to XLSX",
    color: "mint",
  },
];
const faq = [
  [
    "Do my files leave my device?",
    "Supported local tools process files in your browser. Processing methods vary by tool, so check the notice on its page before choosing a file. Your file selection is kept in the current browser session, not a cloud file library.",
  ],
  [
    "Is ConvoTools free to use?",
    "ConvoTools is being built as a free-first toolkit. Availability and limits can vary by tool, particularly where an external processing provider is needed. You can explore the current tools without creating an account.",
  ],
  [
    "Can I work with more than one file?",
    "Yes. The file desk accepts up to 30 files at a time and suggests actions for each format. Batch processing depends on the tool; Merge PDF and Create ZIP are useful places to start.",
  ],
  [
    "What is available in the AI lab?",
    "Image enhancement, background removal, photo restoration and standalone OCR are still in development. They are clearly marked as coming soon in the library, and cannot process files yet.",
  ],
  [
    "Will a conversion preserve everything?",
    "That depends on the format and document. Complex layouts, fonts, formulas and effects may need adjustment after conversion. Each tool describes its supported inputs and limitations. Always review your output before sharing it.",
  ],
];

function FormatPreview() {
  const [selected, setSelected] = useState(0);
  const reducedMotion = useReducedMotion();
  const sample = samples[selected];
  return (
    <div className={"fd-preview fd-preview-" + sample.color}>
      <div className="fd-preview-top">
        <span>A change of format.</span>
        <span>A new possibility.</span>
      </div>
      <div className="fd-format-tabs" aria-label="Preview a conversion">
        {samples.map((item, index) => (
          <button
            key={item.from}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            {item.from}
            <ArrowRight size={13} />
            {item.to}
          </button>
        ))}
      </div>
      <div className="fd-paper-stage" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            className="fd-paper-pair"
            key={sample.from}
            initial={reducedMotion ? false : { opacity: 0, y: 16, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
          >
            <div className="fd-paper fd-paper-source">
              <span className="fd-file-extension">
                .{sample.from.toLowerCase()}
              </span>
              <div className="fd-paper-content">
                <FileText size={25} strokeWidth={1.4} />
                <strong>{sample.name}</strong>
                <span className="fd-paper-line" />
                <span className="fd-paper-line" />
                <span className="fd-paper-line short" />
              </div>
              <span className="fd-paper-foot">Your starting point</span>
            </div>
            <div className="fd-paper fd-paper-result">
              <span className="fd-file-extension">
                .{sample.to.toLowerCase()}
              </span>
              <div className="fd-paper-content">
                <span className="fd-result-symbol">
                  <Check size={23} />
                </span>
                <strong>{sample.name}</strong>
                <span className="fd-paper-line" />
                <span className="fd-paper-line" />
                <span className="fd-paper-line short" />
              </div>
              <span className="fd-paper-foot">Ready for what’s next</span>
            </div>
            <span className="fd-paper-transfer" aria-hidden="true">
              <ArrowUpRight size={25} />
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="fd-preview-bottom">
        <div>
          <small>Format preview</small>
          <p>{sample.caption}</p>
        </div>
        <Link
          href={"/tools/" + slugify(sample.tool)}
          aria-label={"Open " + sample.tool}
        >
          <ArrowUpRight size={22} />
        </Link>
      </div>
    </div>
  );
}

function FileJourney() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const leftX = useTransform(scrollYProgress, [0, 0.5, 1], [-34, 0, 18]);
  const rightX = useTransform(scrollYProgress, [0, 0.5, 1], [34, 0, -18]);
  const leftRotate = useTransform(scrollYProgress, [0, 1], [-12, -3]);
  const rightRotate = useTransform(scrollYProgress, [0, 1], [12, 3]);
  return (
    <section
      ref={ref}
      className="fd-journey"
      id="workflow"
      aria-labelledby="journey-title"
    >
      <div className="fd-journey-copy">
        <span className="fd-section-label">A simpler way through</span>
        <h2 id="journey-title">
          Small task.
          <br />
          Clear path.
          <br />
          Back to your day.
        </h2>
        <p>
          From the file you have to the file you need. Three steps, without the
          detours.
        </p>
        <Link className="fd-inline-link" href="#file-desk">
          Give it a try <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="fd-journey-visual">
        <div className="fd-journey-track" aria-hidden="true" />
        <motion.div
          className="fd-journey-slip fd-slip-first"
          style={reducedMotion ? {} : { x: leftX, rotate: leftRotate }}
        >
          <span className="fd-step">1</span>
          <Upload size={25} />
          <h3>Bring a file.</h3>
          <p>
            Drop it on the desk.
            <br />
            We’ll recognize the format.
          </p>
          <span className="fd-slip-tag">Your original stays yours</span>
        </motion.div>
        <div className="fd-journey-slip fd-slip-middle">
          <span className="fd-step">2</span>
          <Layers2 size={25} />
          <h3>Make your move.</h3>
          <p>
            Pick a tool. Set it up.
            <br />
            Run it when you’re ready.
          </p>
          <span className="fd-slip-tag">You’re in control</span>
        </div>
        <motion.div
          className="fd-journey-slip fd-slip-last"
          style={reducedMotion ? {} : { x: rightX, rotate: rightRotate }}
        >
          <span className="fd-step">3</span>
          <ArrowDown size={25} />
          <h3>Take it with you.</h3>
          <p>
            Download the result.
            <br />
            Get on with the good stuff.
          </p>
          <span className="fd-slip-tag">One less thing on your list</span>
        </motion.div>
      </div>
    </section>
  );
}

export default function FileDesk() {
  const input = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const [category, setCategory] = useState("All tools");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const availableCount = TOOLS.filter(
    (tool) => tool.tag !== "Coming soon",
  ).length;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
      const target = event.target as HTMLElement;
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        event.preventDefault();
        searchInput.current?.focus();
        searchInput.current?.scrollIntoView({
          behavior: reducedMotion ? "instant" : "smooth",
          block: "center",
        });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [reducedMotion]);
  const addFiles = (incoming: FileList | File[]) => {
    const items = Array.from(incoming);
    const valid = items.filter((file) => file.size > 0);
    const accepted = valid.slice(0, Math.max(0, 30 - files.length));
    setNotice(
      valid.length > accepted.length
        ? "The desk holds 30 files. Remove a file to add another."
        : valid.length < items.length
          ? "Empty files were skipped. Choose a file with content to continue."
          : "",
    );
    accepted.forEach((file) =>
      recordActivity({
        type: "upload",
        title: file.name,
        filename: file.name,
        size: file.size,
        description: "Added from the file desk",
      }),
    );
    setFiles((current) => [...current, ...accepted]);
  };
  const chooseFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };
  const dropFiles = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };
  const filtered = useMemo(
    () =>
      TOOLS.filter(
        (tool) =>
          (category === "All tools" || tool.category === category) &&
          (tool.name + " " + tool.description + " " + tool.category)
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [category, query],
  );
  const visibleTools =
    showAll || query || category !== "All tools"
      ? filtered
      : filtered.slice(0, 9);
  const selectCategory = (name: string) => {
    setCategory(name);
    setShowAll(false);
  };
  const closeMenu = () => setMenuOpen(false);
  return (
    <div className="fd-site" id="top">
      <a href="#main-content" className="fd-skip">
        Skip to content
      </a>
      <header className="fd-header">
        <BrandLogo priority width={180} />
        <nav className="fd-nav" aria-label="Main navigation">
          <a href="#toolkit">The toolkit</a>
          <a href="#workflow">How it works</a>
          <Link href="/privacy">Privacy</Link>
          <a href="#questions">Good to know</a>
        </nav>
        <div className="fd-header-actions">
          <Link href="/dashboard" className="fd-workspace-link">
            Your workspace <ArrowUpRight size={16} />
          </Link>
          <button
            className="fd-menu-toggle"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="fd-mobile-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <nav
          id="fd-mobile-nav"
          className="fd-mobile-nav"
          aria-label="Mobile navigation"
          hidden={!menuOpen}
        >
          <a href="#toolkit" onClick={closeMenu}>
            The toolkit
          </a>
          <a href="#workflow" onClick={closeMenu}>
            How it works
          </a>
          <Link href="/privacy" onClick={closeMenu}>Privacy</Link>
          <a href="#questions" onClick={closeMenu}>
            Good to know
          </a>
          <Link href="/dashboard" onClick={closeMenu}>
            Your workspace
          </Link>
        </nav>
      </header>
      <main id="main-content">
        <section className="fd-hero" aria-labelledby="hero-title">
          <Fade asChild><div className="fd-hero-copy">
            <div className="fd-intro">
              <span className="fd-tiny-mark" aria-hidden="true">
                <span />
                <span />
              </span>{" "}
              A good place for your files.
            </div>
            <h1 id="hero-title">
              <span className="ct-hero-line">Everything</span>
              <br />
              <span className="ct-hero-line ct-hero-line-accent">your files need.</span>
            </h1>
            <p>
              One place to convert PDFs, edit documents, transform images, and get the tedious stuff done. Beautifully simple, right in your browser.
            </p>
            <div className="fd-hero-actions">
              <Button asChild tapScale={0.97}><a href="#file-desk" className="fd-button">
                <SlidingText text="Start with a file" /> <MotionUpload size={18} animateOnHover />
              </a></Button>
              <a href="#toolkit" className="fd-secondary-link">
                Find your tool <ArrowDown size={16} />
              </a>
            </div>
            <div className="fd-hero-trust">
              <LockKeyhole size={15} />
              <span>Browser-first. No account needed.</span>
            </div>
          </div></Fade>
          <motion.div
            className="fd-hero-art"
            initial={false}
            animate={reducedMotion ? {} : { y: [12, 0], opacity: [0.6, 1] }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroStage><FormatPreview /></HeroStage>
          </motion.div>
          <div className="fd-hero-baseline">
            <span>Made for the work between the work.</span>
            <a href="#toolkit">
              <CountingNumber number={availableCount} initiallyStable /> tools to get on with it <ArrowDown size={14} />
            </a>
          </div>
        </section>
        <ConversionMotion />
        <section
          id="file-desk"
          className="fd-desk"
          aria-labelledby="desk-title"
        >
          <div className="fd-desk-heading">
            <div>
              <span className="fd-section-label">YOUR STUDIO / START HERE</span>
              <h2 id="desk-title">Drop it. <em>Make it happen.</em></h2>
            </div>
            <p>Bring a file. We’ll find its next move.</p>
          </div>
          <input
            ref={input}
            type="file"
            multiple
            className="fd-hidden-input"
            aria-label="Choose files for your file desk"
            onChange={chooseFiles}
          />
          <div
            className={"fd-dropzone" + (dragging ? " is-dragging" : "")}
            onDragEnter={(event) => {
              event.preventDefault();
              dragDepth.current++;
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault();
              dragDepth.current--;
              if (dragDepth.current <= 0) setDragging(false);
            }}
            onDrop={dropFiles}
          >
            <div className="fd-drop-symbol" aria-hidden="true">
              <Upload size={25} strokeWidth={1.5} />
            </div>
            <div className="fd-drop-copy">
              <h3>
                {dragging
                  ? "Right here. Let it go."
                  : "Drop it like it’s a file."}
              </h3>
              <p>PDFs, images, documents, spreadsheets & more.</p>
            </div>
            <button
              className="fd-button fd-button-light"
              onClick={() => input.current?.click()}
            >
              Choose files <Plus size={18} />
            </button>
          </div>
          <div className="fd-desk-foot">
            <span>
              <ShieldCheck size={14} /> File selection stays in this browser
              session
            </span>
            <span>Up to 30 files · Processing varies by tool</span>
          </div>
          <p className="fd-file-notice" role="status">
            {notice}
          </p>
          <FileActionPanel
            files={files}
            onRemove={(index) => {
              setFiles((current) => current.filter((_, i) => i !== index));
              setNotice("");
            }}
          />
        </section>
        <ProductStory />
        <section
          id="toolkit"
          className="fd-library"
          aria-labelledby="library-title"
        >
          <div className="fd-library-heading">
            <div>
              <span className="fd-section-label">
                One toolkit. Plenty of possibilities.
              </span>
              <h2 id="library-title">Every tool. <em>One place.</em></h2>
            </div>
            <label className="fd-search">
              <Search size={18} />
              <span className="fd-sr-only">Search tools</span>
              <input
                ref={searchInput}
                type="search"
                placeholder="What do you need to do?"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowAll(false);
                }}
              />
              <kbd aria-hidden="true">/</kbd>
            </label>
          </div>
          <div
            className="fd-category-list"
            role="group"
            aria-label="Filter tools by category"
          >
            {TOOL_CATEGORIES.map((item) => (
              <Button
                key={item.name}
                aria-pressed={category === item.name}
                onClick={() => selectCategory(item.name)}
              >
                {item.name === "All tools" ? "Everything" : item.name}
                {item.name === "All tools" && <span>{TOOLS.length}</span>}
              </Button>
            ))}
          </div>
          <div className="fd-results-heading">
            <h3>
              {category === "All tools"
                ? query
                  ? "Search results"
                  : "Everyday file fixes"
                : category + " tools"}
            </h3>
            <span role="status" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
              {query ? " found" : " in this collection"}
            </span>
          </div>
          <div className="fd-tools-grid">
            {visibleTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.name}
                  className={
                    "fd-tool" +
                    (tool.tag === "Coming soon" ? " fd-tool-soon" : "")
                  }
                  href={"/tools/" + slugify(tool.name)}
                >
                  <div className="fd-tool-top">
                    <Icon size={25} strokeWidth={1.5} />
                    <span
                      className={
                        "fd-tool-type fd-type-" +
                        tool.category.split(" ")[0].toLowerCase()
                      }
                    >
                      {tool.tag === "Coming soon"
                        ? "Coming soon"
                        : tool.category}
                    </span>
                  </div>
                  <h4>{tool.name}</h4>
                  <p>{tool.description}</p>
                  <div className="fd-tool-bottom">
                    <span>
                      {tool.inputLabel || "File"}
                      <ArrowRight size={12} />
                      {tool.outputLabel || "File"}
                    </span>
                    <MotionArrow size={18} animateOnHover />
                  </div>
                </Link>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="fd-no-results">
              <Search size={28} />
              <h3>No tools found for that.</h3>
              <p>Try a format like “PDF” or a task like “resize”.</p>
              <button
                className="fd-button"
                onClick={() => {
                  setQuery("");
                  selectCategory("All tools");
                }}
              >
                Reset search <X size={16} />
              </button>
            </div>
          )}
          {category === "All tools" &&
            !query &&
            filtered.length > visibleTools.length && (
              <div className="fd-show-tools">
                <button
                  onClick={() => setShowAll(true)}
                  className="fd-outline-button"
                >
                  Explore all {TOOLS.length} tools <Plus size={17} />
                </button>
                <span>
                  {availableCount} available now. AI tools are on the way.
                </span>
              </div>
            )}
          {showAll && category === "All tools" && !query && (
            <div className="fd-show-tools">
              <button
                className="fd-outline-button"
                onClick={() => {
                  setShowAll(false);
                  document
                    .getElementById("toolkit")
                    ?.scrollIntoView({
                      behavior: reducedMotion ? "instant" : "smooth",
                    });
                }}
              >
                Show fewer tools <ArrowUpRight size={17} />
              </button>
            </div>
          )}
        </section>
        <FileJourney />
        <section className="fd-principle" aria-labelledby="privacy-title">
          <div className="fd-privacy-mark" aria-hidden="true">
            <LockKeyhole size={42} strokeWidth={1.1} />
            <span />
          </div>
          <div>
            <span className="fd-section-label">A bit of peace of mind</span>
            <h2 id="privacy-title">
              Your files.
              <br />
              Your business.
            </h2>
            <p>
              A useful tool shouldn’t ask for more than it needs. Local
              processing wherever supported. Clear notices when it’s different.
              No account between you and a quick fix.
            </p>
            <Link href="/dashboard" className="fd-inline-link">
              Meet your workspace <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="fd-privacy-note">
            <ShieldCheck size={20} />
            <p>The original is still yours.</p>
            <span>
              Keep your source file and review the result. You decide what
              happens next.
            </span>
          </div>
        </section>
        <section id="questions" className="fd-faq" aria-labelledby="faq-title">
          <div>
            <span className="fd-section-label">Good to know</span>
            <h2 id="faq-title">A few loose ends.</h2>
            <p>The practical details, before you start.</p>
          </div>
          <div className="fd-faq-items">
            {faq.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Plus size={19} aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="fd-closing ct-final-stage" aria-labelledby="ct-final-title">
          <div className="ct-final-copy">
            <span className="ct-final-kicker"><FileCheck size={20} animateOnHover /> ONE MORE THING BEFORE YOU GO</span>
            <h2 id="ct-final-title"><RollingText text="Make room for better work." inView /></h2>
            <p>Whatever is next on your desk, the right tool is already here. Start with a file, see what you can do, and get on with the good part.</p>
            <a href="#file-desk" className="fd-button">Bring your first file <MotionArrow size={21} animateOnHover /></a>
          </div>
          <div className="ct-final-scene" aria-hidden="true">
            <span className="ct-final-scene-label">FROM THIS</span>
            <div className="ct-final-card ct-final-card-back"><span>INPUT</span><i/><i/><i/></div>
            <div className="ct-final-card ct-final-card-front"><FileCheck size={52}/><span>ALL SET.</span></div>
            <span className="ct-final-scene-label ct-final-scene-label-right">TO DONE.</span>
          </div>
        </section>
      </main>
      <footer className="fd-footer">
        <div className="fd-footer-main">
          <div>
            <BrandLogo variant="inverse" width={174} />
            <p>
              A home for your everyday file jobs.
              <br />
              Made by Raj Suhandani.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#toolkit">Explore the toolkit</a>
            <Link href="/dashboard">Your workspace</Link>
            <a href="#questions">Questions, answered</a>
            <Link href="/privacy">Privacy & file handling</Link>
            <Link href="/about">About ConvoTools</Link>
            <Link href="/terms">Terms of use</Link>
            <Link href="/cookies">Cookies & storage</Link>
            <Link href="/accessibility">Accessibility</Link>
            <Link href="/licenses">Open-source licenses</Link>
            <Link href="/contact">Contact & support</Link>
            <a
              href="https://github.com/RAJ-SUHANDANI/ConvoTools"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={16} /> View the source <ArrowUpRight size={14} />
            </a>
          </nav>
        </div>
        <div className="fd-footer-bottom">
          <span>© {new Date().getFullYear()} ConvoTools</span>
          <span>Less friction. More making.</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map(([name, text]) => ({
              "@type": "Question",
              name,
              acceptedAnswer: { "@type": "Answer", text },
            })),
          }),
        }}
      />
    </div>
  );
}
