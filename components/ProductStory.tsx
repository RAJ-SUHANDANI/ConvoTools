"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Download,
  GripVertical,
  Play,
  RotateCw,
  Scissors,
  Volume2,
} from "lucide-react";
import { setPendingFiles } from "@/lib/file-session";
import { Fade } from "@animate-ui/react/primitives/effects/fade";
import { RippleButton, RippleButtonRipples } from "@animate-ui/react/primitives/buttons/ripple";
import { MorphingText } from "@animate-ui/react/primitives/texts/morphing";

const rows = [
  ["Field notes", "Design", "12"],
  ["Studio visit", "Research", "08"],
  ["Field notes", "Design", "12"],
  ["Launch assets", "Delivery", "24"],
];
function ToolLink({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="ps-link"
      href={
        "/tools/" +
        name
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/-$/g, "")
      }
    >
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}
export default function ProductStory() {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [order, setOrder] = useState([1, 2, 3]);
  const [format, setFormat] = useState("image/png");
  const [size, setSize] = useState(800);
  const [clean, setClean] = useState(false);
  const [json, setJson] = useState(
    '{"project":"Something good","files":["brief.pdf","cover.png"],"ready":true}',
  );
  const [jsonMessage, setJsonMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let dispose = () => {};
    let cancelled = false;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          gsap.utils.toArray<HTMLElement>(".ps-chapter").forEach((section) => {
            gsap.fromTo(
              section.querySelectorAll(".ps-copy > *, .ps-stage"),
              { y: 30 },
              {
                y: 0,
                duration: 0.85,
                stagger: 0.075,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: section,
                  start: "top 88%",
                  once: true,
                },
              },
            );
          });
          gsap.to(".ps-pdf-paper", {
            rotation: 0,
            stagger: 0.08,
            ease: "none",
            scrollTrigger: {
              trigger: ".ps-pdf",
              start: "top bottom",
              end: "center center",
              scrub: 0.6,
            },
          });
        }, root);
        dispose = () => context.revert();
      },
    );
    return () => {
      cancelled = true;
      dispose();
    };
  }, []);
  async function openSample(tool: string, file: File) {
    setPendingFiles([file]);
    router.push("/tools/" + tool);
  }
  async function samplePdf() {
    setBusy(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      for (const number of order) {
        const page = doc.addPage([600, 760]);
        page.drawRectangle({
          x: 0,
          y: 540,
          width: 600,
          height: 220,
          color: rgb(0.91, 0.88, 1),
        });
        page.drawText(
          ["", "The big idea.", "A little context.", "What happens next."][
            number
          ],
          { x: 48, y: 640, font, size: 34 },
        );
        page.drawText("ConvoTools / Sample project brief / Page " + number, {
          x: 48,
          y: 490,
          font,
          size: 14,
        });
        page.drawText("Your files. A fresh perspective.", {
          x: 48,
          y: 450,
          font,
          size: 18,
        });
      }
      const bytes = await doc.save();
      await openSample(
        "organize-pdf",
        new File([new Uint8Array(bytes)], "project-brief.pdf", {
          type: "application/pdf",
        }),
      );
    } catch {
      setNotice(
        "The sample could not load. You can still choose your own PDF from the toolkit.",
      );
    } finally {
      setBusy(false);
    }
  }
  function downloadPoster() {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#f4ff78";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#5440d8";
    ctx.beginPath();
    ctx.arc(size * 0.8, size * 0.2, size * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#242237";
    ctx.font = `bold ${size * 0.13}px sans-serif`;
    ctx.fillText("MAKE", size * 0.08, size * 0.62);
    ctx.fillText("SOMETHING.", size * 0.08, size * 0.77);
    ctx.font = `${size * 0.027}px sans-serif`;
    ctx.fillText(
      "CONVOTOOLS — ORIGINAL SAMPLE POSTER",
      size * 0.08,
      size * 0.93,
    );
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `something-${size}.${format.split("/")[1]}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setNotice(
          `Downloaded a real ${size} × ${size} ${format.split("/")[1].toUpperCase()} image.`,
        );
      },
      format,
      0.9,
    );
  }
  return (
    <div ref={root} className="product-story" id="explore">
      <div className="ps-manifesto">
        <p>
          A whole lot of useful.
          <br />
          <span>Zero tab-hopping.</span>
        </p>
        <div>
          From the first draft to the final attachment, keep the small jobs
          moving. Explore what’s inside.
          <ArrowDown size={25} />
        </div>
      </div>
      <section className="ps-chapter ps-pdf" aria-labelledby="pdf-story">
        <div className="ps-copy">
          <span className="ps-index">01 / THE PAPERWORK</span>
          <Fade inView asChild><h2 id="pdf-story">
            PDFs with
            <br />
            room to move.
          </h2></Fade>
          <p>
            Reorder the pages. Join the pieces. Turn a finished PDF back into
            something editable. Your document’s next chapter starts here.
          </p>
          <RippleButton className="ps-primary" onClick={samplePdf} disabled={busy} tapScale={0.97}>
            {busy ? "Preparing sample…" : "Open this sample PDF"}
            <ArrowRight size={18} /><RippleButtonRipples color="rgba(213,250,119,.28)" />
          </RippleButton>
          <div className="ps-tool-row">
            <ToolLink name="Merge PDF">Merge</ToolLink>
            <ToolLink name="Split PDF">Split</ToolLink>
            <ToolLink name="PDF to Word">Convert to Word</ToolLink>
          </div>
        </div>
        <div className="ps-stage ps-pages">
          <div className="ps-stage-bar">
            <span>project-brief.pdf</span>
            <span>3 pages · Interactive sample</span>
          </div>
          <div className="ps-page-stack">
            {order.map((number, i) => (
              <button
                key={number}
                className="ps-pdf-paper"
                style={{ transform: `rotate(${(i - 1) * 7}deg)` }}
                onClick={() =>
                  setOrder((current) => [...current.slice(1), current[0]])
                }
                aria-label={`Page ${number}. Click to cycle the page order`}
              >
                <span>THE STUDIO / BRIEF</span>
                <strong>
                  {
                    [
                      "",
                      "The big idea.",
                      "A little context.",
                      "What happens next.",
                    ][number]
                  }
                </strong>
                <div className="ps-paper-lines" />
                <b>{String(number).padStart(2, "0")}</b>
              </button>
            ))}
          </div>
          <div className="ps-stage-bottom">
            <span>
              <GripVertical size={16} /> Click a page to change the order
            </span>
            <button
              onClick={() => setOrder([1, 2, 3])}
              aria-label="Reset page order"
            >
              <RotateCw size={16} />
            </button>
          </div>
        </div>
      </section>
      <section className="ps-chapter ps-images" aria-labelledby="image-story">
        <div className="ps-copy">
          <span className="ps-index">02 / PICTURE THIS</span>
          <Fade inView asChild><h2 id="image-story">
            Right image.
            <br />
            Right size.
            <br />
            <em>Ready to go.</em>
          </h2></Fade>
          <p>
            A cover for your next project. A smaller attachment. An image that
            fits the brief. Convert, compress, resize and crop without opening a
            design app.
          </p>
          <ToolLink name="Resize image">Work with your own image</ToolLink>
        </div>
        <div className="ps-stage ps-image-studio">
          <div className="ps-stage-bar">
            <span>Image playground</span>
            <span>Live export</span>
          </div>
          <div className="ps-poster">
            <i />
            <strong>
              MAKE
              <br />
              SOMETHING.
            </strong>
            <small>CONVOTOOLS / ORIGINAL SAMPLE</small>
          </div>
          <div className="ps-image-controls">
            <label>
              Output
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WEBP</option>
              </select>
            </label>
            <label>
              Size
              <select
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                <option value={400}>400 × 400</option>
                <option value={800}>800 × 800</option>
                <option value={1200}>1200 × 1200</option>
              </select>
            </label>
            <button onClick={downloadPoster} aria-label="Download sample image">
              <Download size={20} />
            </button>
          </div>
        </div>
      </section>
      <section className="ps-document-band">
        <div>
          <span className="ps-index">03 / WORDS THAT WORK</span>
          <h2>
            Keep the thought.
            <br />
            Change the format.
          </h2>
          <p>
            Edit Word documents in the browser. Extract the text you need. Turn
            images of words into editable documents with OCR.
          </p>
          <div className="ps-tool-row">
            <ToolLink name="Word editor">Open the Word editor</ToolLink>
            <ToolLink name="Image to Word (OCR)">Image to Word</ToolLink>
            <ToolLink name="DOCX to TXT">DOCX to text</ToolLink>
          </div>
        </div>
        <div className="ps-editor-sample" aria-label="Word editor sample">
          <div>
            <b>B</b>
            <i>I</i>
            <span>H1</span>
            <span>≡</span>
            <span>100%</span>
          </div>
          <small>PROJECT NOTES / A FRESH START</small>
          <h3>
            Good work starts
            <br />
            with a rough draft.
          </h3>
          <p>Make space for the next idea.</p>
          <p className="ps-highlight">And give it a format that travels.</p>
          <span>Sample document · Edit your own in the Word editor</span>
        </div>
      </section>
      <section className="ps-chapter ps-data" aria-labelledby="data-story">
        <div className="ps-copy">
          <span className="ps-index">04 / BRING SOME ORDER</span>
          <Fade inView asChild><h2 id="data-story">
            Messy rows.
            <br />
            Clearer thinking.
          </h2></Fade>
          <p>
            Give raw data a little structure. Convert CSVs to spreadsheets,
            remove repeated rows and take a sheet into your next presentation as
            a PDF.
          </p>
          <RippleButton
            className="ps-primary"
            tapScale={0.97}
            onClick={() => setClean((value) => !value)}
          >
            {clean ? "Restore sample duplicates" : "Try removing duplicates"}
            {clean ? <RotateCw size={17} /> : <Check size={17} />}<RippleButtonRipples color="rgba(213,250,119,.28)" />
          </RippleButton>
          <ToolLink name="Remove duplicates">
            Clean your own spreadsheet
          </ToolLink>
        </div>
        <div className="ps-stage ps-sheet">
          <div className="ps-stage-bar">
            <span>project-tracker.csv</span>
            <span><MorphingText text={clean ? "3 unique rows" : "4 rows · 1 duplicate"} /></span>
          </div>
          <table>
            <thead>
              <tr>
                <th />
                <th>Project</th>
                <th>Type</th>
                <th>Files</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((_, i) => !clean || i !== 2)
                .map((row, i) => (
                  <tr
                    key={i}
                    className={!clean && i === 2 ? "ps-duplicate" : ""}
                  >
                    <td>{i + 1}</td>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="ps-sheet-result" role="status">
            {clean ? (
              <>
                <Check size={18} /> A little tidier. One repeated row removed.
              </>
            ) : (
              "A duplicate can be easy to miss. Try the button."
            )}
          </div>
          <button
            className="ps-sheet-export"
            onClick={() =>
              openSample(
                "csv-to-xlsx",
                new File(
                  [
                    "Project,Type,Files\n" +
                      rows
                        .filter((_, i) => !clean || i !== 2)
                        .map((row) => row.join(","))
                        .join("\n"),
                  ],
                  "project-tracker.csv",
                  { type: "text/csv" },
                ),
              )
            }
          >
            Open this CSV in the converter
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
      <section className="ps-delivery">
        <div className="ps-delivery-title">
          <span className="ps-index">05 / THE FINISHING TOUCHES</span>
          <h2>
            From “nearly there”
            <br />
            to <em>sent.</em>
          </h2>
          <p>A few more ways to get your work out into the world.</p>
        </div>
        <div className="ps-delivery-grid">
          <Fade inView asChild><article>
            <div className="ps-slide-art" aria-hidden="true">
              <span>01 — A NEW PERSPECTIVE</span>
              <strong>
                Show.
                <br />
                Don’t tell.
              </strong>
              <i />
            </div>
            <h3>Present it your way.</h3>
            <p>
              Take slides into PDF, export slide images or put a PDF into a
              presentation.
            </p>
            <ToolLink name="PPTX to PDF">Explore presentation tools</ToolLink>
          </article></Fade>
          <Fade inView asChild><article>
            <div className="ps-media-art" aria-hidden="true">
              <div>
                <Play size={26} />
                <span>MEDIA / YOUR NEXT CUT</span>
              </div>
              <div className="ps-wave">
                {Array.from({ length: 35 }, (_, i) => (
                  <i key={i} style={{ height: `${12 + ((i * 17) % 43)}px` }} />
                ))}
              </div>
              <div>
                <Scissors size={17} />
                <Volume2 size={18} />
                <span>Convert · Compress · Extract</span>
              </div>
            </div>
            <h3>Make a little more room.</h3>
            <p>
              Compress a video, turn a clip into a GIF or pull out the audio.
              Larger media takes longer to process.
            </p>
            <ToolLink name="Video compressor">Explore media tools</ToolLink>
          </article></Fade>
          <Fade inView asChild><article>
            <div className="ps-zip-art" aria-hidden="true">
              <span>BRIEF.pdf</span>
              <span>COVER.png</span>
              <span>NOTES.docx</span>
              <strong>↘ project.zip</strong>
            </div>
            <h3>All together, now.</h3>
            <p>
              Bundle files into one ZIP for a simpler handoff. Unpack an archive
              when it comes back.
            </p>
            <ToolLink name="Create ZIP">Create an archive</ToolLink>
          </article></Fade>
        </div>
      </section>
      <section className="ps-chapter ps-developer" aria-labelledby="dev-story">
        <div className="ps-copy">
          <span className="ps-index">06 / THE TECHNICAL BITS</span>
          <Fade inView asChild><h2 id="dev-story">
            Small tools.
            <br />
            Very useful tricks.
          </h2></Fade>
          <p>
            Format JSON, encode Base64, generate hashes and make QR codes.
            Practical utilities for the less glamorous parts of building
            something good.
          </p>
          <ToolLink name="JSON formatter">
            Open the full JSON workspace
          </ToolLink>
        </div>
        <div className="ps-stage ps-code">
          <div className="ps-stage-bar">
            <span>scratchpad.json</span>
            <button
              onClick={() => {
                try {
                  setJson(JSON.stringify(JSON.parse(json), null, 2));
                  setJsonMessage("Valid JSON. Formatted with 2 spaces.");
                } catch {
                  setJsonMessage(
                    "That JSON needs a fix. Check the quotes and commas.",
                  );
                }
              }}
            >
              Format JSON ↗
            </button>
          </div>
          <label className="fd-sr-only" htmlFor="sample-json">
            Try formatting JSON
          </label>
          <textarea
            id="sample-json"
            value={json}
            onChange={(e) => setJson(e.target.value)}
            spellCheck={false}
          />
          <div role="status">
            {jsonMessage || "Try editing the sample, then format it."}
          </div>
        </div>
      </section>
      <div className="ps-workspace">
        <div>
          <span className="ps-index">A PLACE TO COME BACK TO</span>
          <h2>
            Your toolkit.
            <br />A little more personal.
          </h2>
          <p>
            Pin the tools you reach for. Find your recent activity. Keep the
            next file job close at hand.
          </p>
          <Link className="ps-primary" href="/dashboard">
            Explore your workspace
            <ArrowRight size={18} />
          </Link>
          <small>Preferences and activity are saved on this device.</small>
        </div>
        <div className="ps-workspace-preview">
          <span>YOUR WORKSPACE</span>
          <h3>
            A good day to
            <br />
            get things done.
          </h3>
          <div>
            <span>♡ Favorite tools</span>
            <b>Yours to choose</b>
          </div>
          <div>
            <span>↗ Recent activity</span>
            <b>Ready when you are</b>
          </div>
          <p>No account to create. Start with a file.</p>
        </div>
      </div>
      <p className="ps-notice" role="status">
        {notice}
      </p>
    </div>
  );
}
