"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { Braces, Check, ChevronDown, ChevronRight, Clipboard, Code2, Download, FileCode2, FileInput, FileSpreadsheet, FileType, Search, TreePine, WandSparkles } from "lucide-react";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type ViewMode = "split" | "code" | "tree" | "output";

function parseJson(source: string): { value: JsonValue | null; error: string | null } {
  if (!source.trim()) return { value: null, error: "Add or paste JSON to get started." };
  try { return { value: JSON.parse(source) as JsonValue, error: null }; }
  catch (error) { return { value: null, error: error instanceof Error ? error.message : "Invalid JSON." }; }
}
function isContainer(value: JsonValue): value is JsonValue[] | { [key: string]: JsonValue } {
  return value !== null && typeof value === "object";
}
function entries(value: JsonValue): [string, JsonValue][] {
  if (Array.isArray(value)) return value.map((item, index) => [String(index), item]);
  if (value && typeof value === "object") return Object.entries(value);
  return [];
}
function contains(value: JsonValue, search: string): boolean {
  if (!search) return true;
  if (!isContainer(value)) return String(value).toLowerCase().includes(search);
  return entries(value).some(([key, child]) => key.toLowerCase().includes(search) || contains(child, search));
}
function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function safeXmlName(value: string): string {
  const safe = value.replace(/[^a-zA-Z0-9_.-]/g, "_");
  return /^[a-zA-Z_]/.test(safe) ? safe : "item_" + safe;
}
function toXml(value: JsonValue, name = "root", depth = 0): string {
  const indent = "  ".repeat(depth), tag = safeXmlName(name);
  if (value === null) return indent + "<" + tag + " />";
  if (Array.isArray(value)) return value.length
    ? indent + "<" + tag + ">\n" + value.map(item => toXml(item, "item", depth + 1)).join("\n") + "\n" + indent + "</" + tag + ">"
    : indent + "<" + tag + " />";
  if (typeof value === "object") {
    const pairs = Object.entries(value);
    return pairs.length
      ? indent + "<" + tag + ">\n" + pairs.map(([key, item]) => toXml(item, key, depth + 1)).join("\n") + "\n" + indent + "</" + tag + ">"
      : indent + "<" + tag + " />";
  }
  return indent + "<" + tag + ">" + escapeXml(String(value)) + "</" + tag + ">";
}
function csvCell(value: unknown): string {
  const text = value === null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}
function flattenObject(value: JsonValue, prefix = ""): Record<string, JsonValue> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { [prefix || "value"]: value };
  const output: Record<string, JsonValue> = {};
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? prefix + "." + key : key;
    if (child && typeof child === "object" && !Array.isArray(child)) Object.assign(output, flattenObject(child, path));
    else output[path] = child;
  }
  return output;
}
function toCsv(value: JsonValue): string {
  if (Array.isArray(value)) {
    if (!value.length) return "";
    if (value.every(item => item !== null && typeof item === "object" && !Array.isArray(item))) {
      const rows = value.map(item => flattenObject(item));
      const headers = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
      return [headers.map(csvCell).join(","), ...rows.map(row => headers.map(key => csvCell(row[key] ?? "")).join(","))].join("\r\n");
    }
    return ["Value", ...value.map(csvCell)].join("\r\n");
  }
  if (value && typeof value === "object") {
    const row = flattenObject(value);
    return ["Key,Value", ...Object.entries(row).map(([key, item]) => [csvCell(key), csvCell(item)].join(","))].join("\r\n");
  }
  return "Value\r\n" + csvCell(value);
}
function downloadText(text: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function TreeNode({ label, value, depth = 0, search = "" }: { label: string; value: JsonValue; depth?: number; search?: string }) {
  const [expanded, setExpanded] = useState(depth < 2);
  if (search && !label.toLowerCase().includes(search) && !contains(value, search)) return null;
  const container = isContainer(value), children = container ? entries(value) : [];
  const kind = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  return (
    <div className="json-tree-node">
      <div className="json-tree-line" style={{ paddingLeft: depth * 17 + 2 }}>
        {container && children.length > 0
          ? <button className="json-tree-toggle" onClick={() => setExpanded(current => !current)} aria-label={expanded ? "Collapse " + label : "Expand " + label}>{expanded ? <ChevronDown /> : <ChevronRight />}</button>
          : <span className="json-tree-spacer" />}
        <span className="json-tree-key">{label}</span><span className="json-tree-colon">:</span>
        {container
          ? <><span className="json-tree-type">{kind}</span><span className="json-tree-count">{children.length} {children.length === 1 ? "item" : "items"}</span>{children.length === 0 && <span className="json-tree-empty">{Array.isArray(value) ? "[]" : "{}"}</span>}</>
          : <span className={"json-tree-value json-tree-" + kind}>{value === null ? "null" : typeof value === "string" ? JSON.stringify(value) : String(value)}</span>}
      </div>
      {container && expanded && children.length > 0 && <div>{children.map(([key, child]) => <TreeNode key={key} label={Array.isArray(value) ? "[" + key + "]" : key} value={child} depth={depth + 1} search={search} />)}</div>}
    </div>
  );
}
const STARTER = "{\n  \"name\": \"ConvoTools\",\n  \"version\": 1,\n  \"features\": [\"tree view\", \"formatter\", \"conversion\"],\n  \"active\": true\n}";

export default function JsonFormatterWorkspace() {
  const [source, setSource] = useState(STARTER);
  const [view, setView] = useState<ViewMode>("split");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Edit JSON or open a .json file. Validation updates as you type.");
  const [outputFormat, setOutputFormat] = useState<"json" | "xml" | "csv" | "min.json">("xml");
  const fileRef = useRef<HTMLInputElement>(null);
  const parsed = useMemo(() => parseJson(source), [source]);
  const pretty = useMemo(() => parsed.error ? "" : JSON.stringify(parsed.value, null, 2), [parsed]);
  const compact = useMemo(() => parsed.error ? "" : JSON.stringify(parsed.value), [parsed]);
  const output = useMemo(() => {
    if (parsed.error) return "";
    if (outputFormat === "xml") return '<?xml version="1.0" encoding="UTF-8"?>\n' + toXml(parsed.value);
    if (outputFormat === "csv") return toCsv(parsed.value);
    if (outputFormat === "min.json") return compact;
    return pretty;
  }, [parsed, outputFormat, pretty, compact]);
  const stats = useMemo(() => {
    const counts = { keys: 0, arrays: 0, objects: 0 };
    if (parsed.error || parsed.value === null) return counts;
    const visit = (value: JsonValue) => {
      if (Array.isArray(value)) { counts.arrays++; value.forEach(visit); }
      else if (value && typeof value === "object") { counts.objects++; const pairs = Object.entries(value); counts.keys += pairs.length; pairs.forEach(([, child]) => visit(child)); }
    };
    visit(parsed.value);
    return counts;
  }, [parsed]);
  const openFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    try { setSource(await file.text()); setView("split"); setMessage("Loaded " + file.name + ". The file is parsed and validated locally."); }
    catch { setMessage("Could not read the selected file."); }
  };
  const format = () => {
    if (parsed.error) { setMessage("Fix the syntax error before formatting."); return; }
    setSource(pretty); setMessage("JSON formatted with two-space indentation.");
  };
  const minify = () => {
    if (parsed.error) { setMessage("Fix the syntax error before minifying."); return; }
    setSource(compact); setMessage("JSON minified.");
  };
  const copy = async (value: string, label: string) => {
    try { await navigator.clipboard.writeText(value); setMessage(label + " copied."); }
    catch { setMessage("Clipboard access is unavailable. Select the text and copy it manually."); }
  };
  const download = () => {
    if (parsed.error) { setMessage("Enter valid JSON before exporting."); return; }
    const mime = outputFormat === "xml" ? "application/xml;charset=utf-8" : outputFormat === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8";
    downloadText(output, outputFormat === "min.json" ? "minified.json" : "converted." + outputFormat, mime);
    setMessage("Your " + outputFormat.toUpperCase() + " file is ready.");
  };
  return (
    <section className="json-workbench" aria-label="JSON formatter, tree viewer and converter">
      <header className="json-workbench-head">
        <div className="json-workbench-title"><span className="json-app-icon"><Braces /></span><div><b>JSON Studio</b><small>FORMAT · INSPECT · CONVERT</small></div></div>
        <div className="json-workbench-actions">
          <button onClick={() => fileRef.current?.click()}><FileInput size={14} /> Open JSON</button>
          <button onClick={() => { setSource("{}"); setMessage("Started a new JSON document."); }}><WandSparkles size={14} /> New</button>
        </div>
      </header>
      <input ref={fileRef} type="file" accept=".json,.txt,application/json,text/plain" hidden onChange={openFile} />
      <div className="json-workbench-stats">
        <span><b>{source.length.toLocaleString()}</b> characters</span><span><b>{stats.keys}</b> keys</span><span><b>{stats.objects}</b> objects</span><span><b>{stats.arrays}</b> arrays</span>
        <span className={parsed.error ? "json-status-error" : "json-status-valid"}>{parsed.error ? "Syntax error" : "Valid JSON"} {parsed.error ? "" : <Check size={12} />}</span>
      </div>
      <nav className="json-workbench-tabs" aria-label="JSON views">
        {(["split", "code", "tree", "output"] as ViewMode[]).map(mode => <button key={mode} className={view === mode ? "active" : ""} onClick={() => setView(mode)}>{mode === "split" ? "Split view" : mode === "code" ? "Code" : mode === "tree" ? "Tree" : "Converted output"}</button>)}
        <span className="json-workbench-tab-spacer" />
        <button onClick={format} disabled={!!parsed.error}>Format</button><button onClick={minify} disabled={!!parsed.error}>Minify</button>
      </nav>
      <div className={"json-workbench-main json-view-" + view}>
        {(view === "split" || view === "code") && <div className="json-panel json-source-panel">
          <div className="json-panel-head"><span><Code2 size={14} /> JSON SOURCE</span><button onClick={() => copy(source, "Source JSON")}><Clipboard size={13} /> Copy</button></div>
          <textarea className="json-code-editor" spellCheck={false} autoCapitalize="off" autoCorrect="off" value={source} onChange={event => setSource(event.target.value)} aria-label="Edit JSON source" placeholder="Paste or type JSON here…" />
          {parsed.error && <p className="json-inline-error" role="alert">{parsed.error}</p>}
        </div>}
        {(view === "split" || view === "tree") && <div className="json-panel json-tree-panel">
          <div className="json-panel-head"><span><TreePine size={14} /> TREE VIEW</span><span className="json-live-pill"><i /> LIVE</span></div>
          <label className="json-tree-search"><Search size={14} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a key or value…" /></label>
          <div className="json-tree-scroll">
            {parsed.error ? <div className="json-tree-empty-state"><Braces size={22} /><b>Waiting for valid JSON</b><span>Correct the syntax to explore your data tree.</span></div>
              : <TreeNode label="root" value={parsed.value as JsonValue} search={search.toLowerCase()} />}
          </div>
        </div>}
        {view === "output" && <div className="json-panel json-output-panel">
          <div className="json-panel-head"><span><FileCode2 size={14} /> CONVERTED OUTPUT</span><button onClick={() => copy(output, "Converted output")} disabled={!output}><Clipboard size={13} /> Copy</button></div>
          <pre className="json-output-code">{parsed.error ? "Valid JSON is required to generate output." : output}</pre>
        </div>}
      </div>
      <div className="json-convert-row">
        <div className="json-convert-label"><FileType size={15} /><div><b>Convert your JSON</b><small>Generate a downloadable file in another format.</small></div></div>
        <div className="json-convert-controls">
          <select aria-label="Output format" value={outputFormat} onChange={event => setOutputFormat(event.target.value as typeof outputFormat)}>
            <option value="xml">XML</option><option value="csv">CSV</option><option value="json">Formatted JSON</option><option value="min.json">Minified JSON</option>
          </select>
          <button onClick={() => { setView("output"); download(); }} disabled={!!parsed.error}><Download size={14} /> Download</button>
        </div>
      </div>
      <footer className="json-workbench-status"><span className={parsed.error ? "json-status-error" : "json-status-valid"}><i />{parsed.error ? "JSON needs attention" : "All changes parsed locally"}</span><span>{message}</span><span><FileSpreadsheet size={12} /> Browser-only</span></footer>
    </section>
  );
}
