/* ConvoTools browser-side PDF reconstruction worker.
 * PDF bytes are processed in this worker; they are never sent to a conversion API.
 * The pinned Pyodide/pdf2docx runtime is fetched as executable OSS assets only.
 */
const ASSET_BASE = "https://cdn.jsdelivr.net/npm/pdf2docx-wasm@0.1.0/";
const PACKAGE_FILES = [
  "pymupdf-1.26.1-cp313-none-pyodide_2025_0_wasm32.whl",
  "python_docx-1.2.0-py3-none-any.whl",
  "pdf2docx-0.5.8-py3-none-any.whl",
  "lxml-5.4.0-cp313-cp313-pyodide_2025_0_wasm32.whl",
  "typing_extensions-4.12.2-py3-none-any.whl",
  "numpy-2.2.5-cp313-cp313-pyodide_2025_0_wasm32.whl",
  "opencv_python-4.11.0.86-cp313-cp313-pyodide_2025_0_wasm32.whl",
  "fonttools-4.56.0-py3-none-any.whl"
];

let runtimePromise = null;
const sendPhase = (id, phase, progress) => self.postMessage({ id, type: "phase", phase, progress });

const pythonSource = String.raw`
import base64
import json
import fitz
from pdf2docx import Converter

def convert_pdf_to_docx():
    doc = fitz.open("/input.pdf")
    try:
        if doc.needs_pass:
            raise ValueError("This PDF is password protected. Unlock it before converting.")
        if len(doc) > 80:
            raise ValueError("PDF-to-Word is limited to 80 pages per conversion in the browser. Split this PDF into smaller files.")
    finally:
        doc.close()

    converter = Converter("/input.pdf")
    try:
        converter.convert("/output.docx")
    finally:
        converter.close()

def _xy(point):
    return [round(float(point.x), 3), round(float(point.y), 3)]

def _rect(rect):
    return [round(float(rect.x0), 3), round(float(rect.y0), 3),
            round(float(rect.x1), 3), round(float(rect.y1), 3)]

def _color(value):
    if value is None:
        return None
    try:
        return [round(float(value[0]), 4), round(float(value[1]), 4), round(float(value[2]), 4)]
    except Exception:
        return None

def analyze_pdf_to_json():
    doc = fitz.open("/input.pdf")
    try:
        if doc.needs_pass:
            raise ValueError("This PDF is password protected. Unlock it before converting.")
        if len(doc) > 60:
            raise ValueError("PDF-to-PowerPoint and PDF-to-Excel are limited to 60 pages per conversion in the browser.")
        pages = []
        extracted_image_bytes = 0

        for page_index, page in enumerate(doc):
            result = {
                "page": page_index + 1,
                "width": round(float(page.rect.width), 3),
                "height": round(float(page.rect.height), 3),
                "items": [],
                "drawings": [],
                "tables": []
            }
            content = page.get_text("dict")
            for block in content.get("blocks", []):
                if block.get("type") == 0:
                    for line in block.get("lines", []):
                        direction = line.get("dir", (1.0, 0.0))
                        for span in line.get("spans", []):
                            text = span.get("text", "")
                            if not text:
                                continue
                            result["items"].append({
                                "type": "text",
                                "text": text,
                                "bbox": [round(float(v), 3) for v in span.get("bbox", (0,0,0,0))],
                                "font": span.get("font", "Arial"),
                                "size": round(float(span.get("size", 10)), 3),
                                "flags": int(span.get("flags", 0)),
                                "color": int(span.get("color", 0)),
                                "direction": [round(float(direction[0]), 5), round(float(direction[1]), 5)]
                            })
                elif block.get("type") == 1:
                    raw_image = block.get("image", b"")
                    if raw_image:
                        extracted_image_bytes += len(raw_image)
                        if extracted_image_bytes > 70 * 1024 * 1024:
                            raise ValueError("This PDF contains too many or too-large embedded images for browser reconstruction. Try smaller sections.")
                        result["items"].append({
                            "type": "image",
                            "bbox": [round(float(v), 3) for v in block.get("bbox", (0,0,0,0))],
                            "width": int(block.get("width", 0)),
                            "height": int(block.get("height", 0)),
                            "ext": block.get("ext", "png"),
                            "data": base64.b64encode(raw_image).decode("ascii")
                        })

            # Preserve native vector elements as editable shapes wherever the PDF
            # path can be represented safely as a simple line, rectangle or quad.
            for drawing in page.get_drawings():
                paths = []
                for item in drawing.get("items", []):
                    kind = item[0]
                    if kind == "l":
                        paths.append({"type": "line", "points": [_xy(item[1]), _xy(item[2])]})
                    elif kind == "re":
                        paths.append({"type": "rect", "rect": _rect(item[1])})
                    elif kind == "qu":
                        quad = item[1]
                        paths.append({"type": "quad", "points": [_xy(quad.ul), _xy(quad.ur), _xy(quad.lr), _xy(quad.ll)]})
                    elif kind == "c":
                        paths.append({"type": "curve", "points": [_xy(item[1]), _xy(item[2]), _xy(item[3]), _xy(item[4])]})
                if paths:
                    result["drawings"].append({
                        "items": paths,
                        "rect": _rect(drawing.get("rect", fitz.Rect(0,0,0,0))),
                        "fill": _color(drawing.get("fill")),
                        "stroke": _color(drawing.get("color")),
                        "width": round(float(drawing.get("width", 1) or 1), 3),
                        "closePath": bool(drawing.get("closePath", False)),
                        "fillOpacity": round(float(drawing.get("fill_opacity", 1) or 1), 3),
                        "strokeOpacity": round(float(drawing.get("stroke_opacity", 1) or 1), 3)
                    })

            # PyMuPDF's table finder detects ruled and text-aligned table cells.
            # Keep each detected table as actual cell data for an editable XLSX.
            try:
                finder = page.find_tables()
                tables = getattr(finder, "tables", []) if finder else []
                for table_index, table in enumerate(tables):
                    extracted = table.extract()
                    if extracted:
                        result["tables"].append({
                            "index": table_index + 1,
                            "bbox": [round(float(v), 3) for v in table.bbox],
                            "rows": [[("" if cell is None else str(cell)) for cell in row] for row in extracted]
                        })
            except Exception as table_error:
                result["tableWarning"] = str(table_error)[:240]

            pages.append(result)

        return json.dumps({"pages": pages, "pageCount": len(pages)}, ensure_ascii=False)
    finally:
        doc.close()
`;

async function loadRuntime(id) {
  if (runtimePromise) return runtimePromise;
  runtimePromise = (async () => {
    sendPhase(id, "Loading the browser-only document engine…", 0.08);
    const { loadPyodide } = await import("https://cdn.jsdelivr.net/npm/pdf2docx-wasm@0.1.0/pyodide.js");
    const pyodide = await loadPyodide({ indexURL: ASSET_BASE });
    sendPhase(id, "Preparing PDF and document reconstruction packages…", 0.24);
    await Promise.all(PACKAGE_FILES.map(file => pyodide.loadPackage(ASSET_BASE + file)));
    sendPhase(id, "Starting the local reconstruction engine…", 0.48);
    pyodide.runPython(pythonSource);
    return pyodide;
  })().catch(error => {
    runtimePromise = null;
    throw error;
  });
  return runtimePromise;
}

self.addEventListener("message", async event => {
  const { id, operation, pdfBuffer } = event.data || {};
  if (!id || !(pdfBuffer instanceof ArrayBuffer)) return;

  try {
    const pyodide = await loadRuntime(id);
    sendPhase(id, operation === "docx" ? "Rebuilding editable Word content…" : "Analysing text, images, vector elements and tables…", 0.66);

    try { pyodide.FS.unlink("/input.pdf"); } catch {}
    try { pyodide.FS.unlink("/output.docx"); } catch {}
    pyodide.FS.writeFile("/input.pdf", new Uint8Array(pdfBuffer));

    if (operation === "docx") {
      pyodide.globals.get("convert_pdf_to_docx")();
      const source = pyodide.FS.readFile("/output.docx");
      const output = new Uint8Array(source.length);
      output.set(source);
      sendPhase(id, "Preparing the editable Word file…", 0.96);
      self.postMessage({ id, type: "result", operation, output: output.buffer }, [output.buffer]);
    } else if (operation === "analyze") {
      const jsonResult = pyodide.globals.get("analyze_pdf_to_json")();
      try {
        const json = jsonResult.toString();
        sendPhase(id, "Building editable Office elements…", 0.94);
        self.postMessage({ id, type: "result", operation, json });
      } finally {
        jsonResult.destroy();
      }
    } else {
      throw new Error("Unsupported PDF reconstruction operation.");
    }
  } catch (error) {
    self.postMessage({
      id,
      type: "error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});
