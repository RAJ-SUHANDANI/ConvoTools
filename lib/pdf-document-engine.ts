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

type PendingRequest = {
  operation: "docx" | "analyze";
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  onProgress?: EngineProgress;
};

let sharedWorker: Worker | null = null;
const pendingRequests = new Map<string, PendingRequest>();

function getSharedWorker(): Worker {
  if (sharedWorker) return sharedWorker;
  const worker = new Worker("/workers/pdf-document-engine.worker.js", {
    type: "module",
    name: "convotools-pdf-document-engine",
  });
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const message = event.data;
    if (!message) return;
    const pending = pendingRequests.get(message.id);
    if (!pending) return;
    if (message.type === "phase") {
      pending.onProgress?.(Math.max(0, Math.min(1, message.progress)), message.phase);
      return;
    }
    pendingRequests.delete(message.id);
    if (message.type === "error") {
      pending.reject(new Error(message.error || "The PDF reconstruction engine could not process this file."));
      return;
    }
    if (message.type === "result" && message.operation === "docx" && pending.operation === "docx") {
      pending.resolve(new Blob([message.output], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }));
      return;
    }
    if (message.type === "result" && message.operation === "analyze" && pending.operation === "analyze") {
      try {
        pending.resolve(JSON.parse(message.json) as PdfLayoutAnalysis);
      } catch {
        pending.reject(new Error("The PDF engine returned an invalid document structure. Please try another PDF."));
      }
      return;
    }
    pending.reject(new Error("The PDF engine returned an unexpected response for this operation."));
  };
  const failAll = (detail: string) => {
    sharedWorker = null;
    const requests = Array.from(pendingRequests.values());
    pendingRequests.clear();
    worker.terminate();
    requests.forEach(request => request.reject(new Error(detail)));
  };
  worker.onerror = (event) => {
    event.preventDefault();
    failAll(event.message || "The local PDF worker stopped unexpectedly.");
  };
  worker.onmessageerror = () => {
    failAll("The browser could not read the PDF engine response. Try a smaller PDF or another browser.");
  };
  sharedWorker = worker;
  return worker;
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
    const request: PendingRequest = {
      operation,
      resolve: value => resolve(value as T),
      reject,
      onProgress,
    };
    let worker: Worker;
    try {
      worker = getSharedWorker();
      pendingRequests.set(id, request);
    } catch (error) {
      reject(error instanceof Error ? error : new Error("Could not start the local PDF worker."));
      return;
    }

    file.arrayBuffer().then(pdfBuffer => {
      if (!pendingRequests.has(id)) return;
      try {
        worker.postMessage({ id, operation, pdfBuffer }, [pdfBuffer]);
      } catch (error) {
        pendingRequests.delete(id);
        reject(error instanceof Error ? error : new Error("Could not send the PDF to the local worker."));
      }
    }).catch(error => {
      pendingRequests.delete(id);
      reject(error instanceof Error ? error : new Error("Could not read the selected PDF."));
    });
  });
}

export function reconstructPdfToDocx(file: File, onProgress?: EngineProgress): Promise<Blob> {
  return runWorker<Blob>(file, "docx", onProgress);
}

export function analyzePdfForOffice(file: File, onProgress?: EngineProgress): Promise<PdfLayoutAnalysis> {
  return runWorker<PdfLayoutAnalysis>(file, "analyze", onProgress);
}
