export type PdfLayoutText = {
  type: "text";
  text: string;
  bbox: [number, number, number, number];
  font: string;
  size: number;
  flags: number;
  color: number;
  direction: [number, number];
};

export type PdfLayoutImage = {
  type: "image";
  bbox: [number, number, number, number];
  width: number;
  height: number;
  ext: string;
  data: string;
};

export type PdfLayoutItem = PdfLayoutText | PdfLayoutImage;
export type PdfDrawingItem =
  | { type: "line"; points: [[number, number], [number, number]] }
  | { type: "rect"; rect: [number, number, number, number] }
  | { type: "quad"; points: [[number, number], [number, number], [number, number], [number, number]] }
  | { type: "curve"; points: [[number, number], [number, number], [number, number], [number, number]] };

export type PdfLayoutDrawing = {
  items: PdfDrawingItem[];
  rect: [number, number, number, number];
  fill: [number, number, number] | null;
  stroke: [number, number, number] | null;
  width: number;
  closePath: boolean;
  fillOpacity: number;
  strokeOpacity: number;
};

export type PdfDetectedTable = {
  index: number;
  bbox: [number, number, number, number];
  rows: string[][];
};

export type PdfLayoutPage = {
  page: number;
  width: number;
  height: number;
  items: PdfLayoutItem[];
  drawings: PdfLayoutDrawing[];
  tables: PdfDetectedTable[];
  tableWarning?: string;
};

export type PdfLayoutAnalysis = {
  pageCount: number;
  pages: PdfLayoutPage[];
};

export type EngineProgress = (progress: number, phase: string) => void;

type WorkerResponse =
  | { id: string; type: "phase"; phase: string; progress: number }
  | { id: string; type: "result"; operation: "docx"; output: ArrayBuffer }
  | { id: string; type: "result"; operation: "analyze"; json: string }
  | { id: string; type: "error"; error: string };

function createRequestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "pdf-" + Date.now() + "-" + Math.random().toString(36).slice(2);
}

function runWorker<T>(
  file: File,
  operation: "docx" | "analyze",
  onProgress?: EngineProgress,
): Promise<T> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return Promise.reject(new Error("This PDF conversion requires a modern browser with Web Worker and WebAssembly support."));
  }
  if (file.size > 45 * 1024 * 1024) {
    return Promise.reject(new Error("This browser-only PDF conversion is limited to 45 MB per file to protect device memory."));
  }

  return new Promise<T>((resolve, reject) => {
    const id = createRequestId();
    const worker = new Worker("/workers/pdf-document-engine.worker.js", {
      type: "module",
      name: "convotools-pdf-document-engine",
    });
    let settled = false;

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      worker.terminate();
      callback();
    };

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (!message || message.id !== id) return;
      if (message.type === "phase") {
        onProgress?.(Math.max(0, Math.min(1, message.progress)), message.phase);
        return;
      }
      if (message.type === "error") {
        finish(() => reject(new Error(message.error || "The PDF reconstruction engine could not process this file.")));
        return;
      }
      if (message.type === "result" && message.operation === "docx" && operation === "docx") {
        finish(() => resolve(new Blob([message.output], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }) as T));
        return;
      }
      if (message.type === "result" && message.operation === "analyze" && operation === "analyze") {
        try {
          const analysis = JSON.parse(message.json) as PdfLayoutAnalysis;
          finish(() => resolve(analysis as T));
        } catch {
          finish(() => reject(new Error("The PDF engine returned an invalid document structure. Please try another PDF.")));
        }
      }
    };

    worker.onerror = (event) => {
      event.preventDefault();
      const detail = event.message || "The local PDF worker stopped unexpectedly.";
      finish(() => reject(new Error(detail)));
    };

    worker.onmessageerror = () => {
      finish(() => reject(new Error("The browser could not read the PDF engine response. Try a smaller PDF or another browser.")));
    };

    file.arrayBuffer().then((pdfBuffer) => {
      if (settled) return;
      worker.postMessage({ id, operation, pdfBuffer }, [pdfBuffer]);
    }).catch((error) => {
      finish(() => reject(error instanceof Error ? error : new Error("Could not read the selected PDF.")));
    });
  });
}

export function reconstructPdfToDocx(file: File, onProgress?: EngineProgress): Promise<Blob> {
  return runWorker<Blob>(file, "docx", onProgress);
}

export function analyzePdfForOffice(file: File, onProgress?: EngineProgress): Promise<PdfLayoutAnalysis> {
  return runWorker<PdfLayoutAnalysis>(file, "analyze", onProgress);
}
