// B"H
import { simulateRuntime } from "../core/simulateRuntime.js";

const DEFAULT_MODES = ["merkava", "merkava-image", "chrome-if-available"];

/**
 * B"H
 * Chapter: The Render Lab became three eyes in one face.
 *
 * Mode one sees structure: Merkava virtual DOM. Mode two paints pixels from the
 * synthetic DOM. Mode three asks real Chrome only when the vessel has it. The
 * report never lies: every screenshot carries proof, backend, and fallback
 * reasons so UI debugging can distinguish actual pixels from hopeful text.
 */
export async function runRenderLab(options = {}) {
  const modes = normalizeModes(options.modes || options.mode || DEFAULT_MODES);
  const base = normalizeBaseOptions(options);
  const results = [];
  for (const mode of modes) results.push(await runRenderMode(mode, base));
  return {
    BH: "B\"H",
    ok: results.every(result => result.ok !== false),
    action: "domDomRenderLab",
    title: options.title || "Awtsmoos DOM/Merkava Render Lab",
    modes,
    summary: summarize(results),
    reportHtml: renderReportHtml(results, options),
    results,
    suggestions: suggestions(results)
  };
}

export async function runRenderMode(mode = "merkava", options = {}) {
  const name = String(mode || "merkava").toLowerCase();
  const screenshot = name.includes("image") || name.includes("chrome") || name.includes("screenshot");
  const chrome = name.includes("chrome");
  const run = await simulateRuntime({
    ...options,
    runtime: options.runtime || "browser",
    snapshot: screenshot || options.snapshot === true,
    format: screenshot ? "png" : options.format || "json",
    snapshotBackend: chrome ? "chrome" : "merkava",
    screenshotBackend: chrome ? "chrome" : "merkava"
  });
  return decorateModeResult(name, run);
}

function normalizeBaseOptions(options = {}) {
  const html = options.html || options.content || "<!doctype html><body><main><h1>B\"H Render Lab</h1><p>Awtsmoos virtual DOM is alive.</p></main></body>";
  const files = options.files && typeof options.files === "object" ? options.files : { [options.entry || "index.html"]: html };
  return {
    entry: options.entry || "index.html",
    files,
    html,
    url: options.url || "http://localhost:8080/",
    origin: options.origin || "http://localhost:8080/",
    width: Number(options.width || options.viewportWidth || 960),
    height: Number(options.height || options.viewportHeight || 640),
    interactions: options.interactions || options.actions || options.browserActions || [],
    returnValues: options.returnValues || options.values || []
  };
}

function normalizeModes(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value || "").split(/[,+\s]+/).map(x => x.trim()).filter(Boolean);
}

function decorateModeResult(mode, run = {}) {
  const snapshot = run.snapshot || {};
  const image = snapshot.image || null;
  const dom = snapshot.dom || run.domSnapshot || null;
  return {
    ok: run.ok !== false,
    mode,
    engine: run.engine || "merkava",
    runtime: run.runtime || "browser",
    score: run.score ?? (run.ok === false ? 40 : 100),
    errors: run.errors || [],
    console: run.console || [],
    values: run.values || {},
    domSummary: summarizeDom(dom),
    screenshot: image ? { backend: image.backend, width: image.width, height: image.height, bytes: image.bytes, dataUrl: image.dataUrl, proof: image.proof, fallbackReason: image.fallbackReason || null } : null,
    rawKeys: Object.keys(run || {}).slice(0, 40)
  };
}

function summarizeDom(node) {
  const counts = { nodes: 0, textBytes: 0, tags: {} };
  walk(node, counts);
  return counts;
}

function walk(node, counts) {
  if (!node || typeof node !== "object") return;
  counts.nodes++;
  const tag = String(node.localName || node.tagName || "unknown").toLowerCase();
  counts.tags[tag] = (counts.tags[tag] || 0) + 1;
  counts.textBytes += Buffer.byteLength(String(node.textContent || ""), "utf8");
  for (const child of node.children || []) walk(child, counts);
}

function summarize(results) {
  return {
    modeCount: results.length,
    okModes: results.filter(r => r.ok).length,
    screenshotModes: results.filter(r => r.screenshot).length,
    totalNodes: results.reduce((n, r) => n + Number(r.domSummary?.nodes || 0), 0),
    backends: results.map(r => r.screenshot?.backend || r.engine).filter(Boolean)
  };
}

function suggestions(results) {
  const out = [];
  if (results.some(r => r.errors?.length)) out.push("Open stackTraces/errors for the failing mode and add a smaller isolatedHtmlTest reproduction.");
  if (!results.some(r => r.screenshot)) out.push("Request mode=merkava-image or mode=chrome-if-available to generate screenshot proof.");
  if (results.some(r => r.screenshot?.fallbackReason === "chrome_not_found")) out.push("Chrome screenshot requested but Chrome was not found; install Chrome or use the Merkava software renderer.");
  out.push("Use previewPage or responseMode=ephemeral for large render reports instead of pasting the full DOM into chat.");
  return out;
}

export function renderReportHtml(results = [], options = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(options.title || "Awtsmoos Render Lab")}</title>${style()}</head><body><main><header><p>B\"H · DOM-DOM / Merkava Render Lab</p><h1>${esc(options.title || "Awtsmoos Render Lab")}</h1><p>Compare virtual DOM simulation, software screenshots, and real Chrome when available.</p></header><section class="grid">${results.map(renderCard).join("")}</section></main></body></html>`;
}

function renderCard(result) {
  const img = result.screenshot?.dataUrl ? `<img alt="${esc(result.mode)} screenshot" src="${result.screenshot.dataUrl}">` : `<div class="noimg">No screenshot for this mode</div>`;
  return `<article><span>${esc(result.mode)}</span><h2>${result.ok ? "OK" : "FAILED"} · ${esc(result.screenshot?.backend || result.engine)}</h2>${img}<dl><dt>DOM nodes</dt><dd>${result.domSummary?.nodes || 0}</dd><dt>Score</dt><dd>${esc(result.score)}</dd><dt>Errors</dt><dd>${esc((result.errors || []).length)}</dd></dl><pre>${esc(JSON.stringify(result.screenshot?.proof || result.domSummary || {}, null, 2))}</pre></article>`;
}

function style() {
  return `<style>body{margin:0;background:#050916;color:#edf7ff;font-family:Inter,system-ui,sans-serif}main{max-width:1240px;margin:auto;padding:28px}header{padding:28px;border:1px solid #61dfff44;border-radius:28px;background:radial-gradient(circle at top right,#24537b,transparent 42%),linear-gradient(135deg,#0b1428,#101c3a)}h1{font-size:clamp(2rem,7vw,5rem);letter-spacing:-.06em;line-height:.9}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:18px}article{border:1px solid #ffffff18;border-radius:24px;padding:16px;background:#ffffff0b;box-shadow:0 20px 60px #0008}span{display:inline-block;border-radius:999px;padding:6px 10px;background:#77e5ff1d;color:#8beaff;font-weight:900}img,.noimg{width:100%;min-height:180px;object-fit:contain;border-radius:18px;background:#050710;border:1px solid #ffffff16}pre{white-space:pre-wrap;overflow:auto;max-height:220px;color:#ffe08a}</style>`;
}
function esc(value) { return String(value ?? "").replace(/[&<>\"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch])); }
