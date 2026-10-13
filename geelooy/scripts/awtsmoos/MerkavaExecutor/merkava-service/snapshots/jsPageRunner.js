// B"H
/**
 * @file jsPageRunner.js
 * @description Execute a real page through the Merkava browser engine
 * (merkava-runtime UnifiedSimulation -> SyntheticBrowserRuntime): real
 * virtual DOM, real fetch, real script execution with error capture
 * (message + file + line + stack) and console capture.
 *
 * This is the genuine page runner: scripts actually run, the DOM actually
 * updates, and the returned finalHtml reflects post-JS state — feed it to
 * the software renderer for screenshots of JS-driven pages.
 *
 *   import { runPageWithJs } from './jsPageRunner.js';
 *   const r = await runPageWithJs({ url: 'https://example.com' });
 *   // r.jsErrors -> [{name,message,file,line,stack}]
 *   // r.consoleLogs -> [{level,text}]
 *   // r.finalHtml -> serialized DOM after JS ran
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const __here = path.dirname(fileURLToPath(import.meta.url));
const __require = createRequire(__here + "/");

// CJS engine modules (loaded lazily so importers that never run pages pay nothing).
let __sim = null;
function sim() {
  if (!__sim) {
    __sim = __require("../../merkava-runtime/UnifiedSimulation.js");
  }
  return __sim;
}
let __Serializer = null;
function Serializer() {
  if (!__Serializer) {
    __Serializer = __require("../../merkava-browser/VirtualHtmlSerializer.js").VirtualHtmlSerializer;
  }
  return __Serializer;
}

export const VERSION = "1.0.0";
const DEFAULT_WAIT_MS = 2500;
const DEFAULT_FETCH_TIMEOUT_MS = 15000;
const MAX_SCRIPTS = 60;
const FETCH_CONCURRENCY = 6;

function extractScriptSrcs(html, baseUrl) {
  const out = [];
  const seen = new Set();
  const re = /<script\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1] || "";
    const srcM = attrs.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!srcM) continue;
    const src = srcM[1] ?? srcM[2] ?? srcM[3] ?? "";
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) continue;
    const typeM = attrs.match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const type = (typeM?.[1] ?? typeM?.[2] ?? typeM?.[3] ?? "").toLowerCase();
    if (type.includes("json") || type.includes("importmap") || type.includes("template")) continue;
    let abs;
    try {
      abs = new URL(src, baseUrl).href;
    } catch { continue; }
    if (seen.has(abs)) continue;
    seen.add(abs);
    out.push(abs);
    if (out.length >= MAX_SCRIPTS) break;
  }
  return out;
}

async function fetchText(url, timeoutMs) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: { "User-Agent": "Merkava/1.0 (page-runner)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function fetchAll(urls, timeoutMs) {
  const results = {};
  let i = 0;
  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      try {
        results[url] = await fetchText(url, timeoutMs);
      } catch (e) {
        results[url] = null; // missing script: engine reports it; don't hard-fail
      }
    }
  }
  const workers = [];
  for (let k = 0; k < Math.min(FETCH_CONCURRENCY, urls.length); k++) workers.push(worker());
  await Promise.all(workers);
  return results;
}

function parseErrorLocation(stack, fallbackFile) {
  // Stacks look like: "at eval (eval at <anonymous> (...), <anonymous>:4:100)"
  // or reference resolved file keys. Extract the most specific file:line.
  const s = String(stack || "");
  let file = fallbackFile || "<inline>";
  let line = 0;
  // <anonymous>:LINE:COL from inline scripts
  const anon = s.match(/<anonymous>:(\d+):(\d+)/);
  if (anon) line = parseInt(anon[1], 10) || 0;
  // A resolved http(s) file key with :line:col
  const urlMatch = s.match(/(https?:\/\/[^\s):"']+):(\d+):(\d+)/);
  if (urlMatch) {
    file = urlMatch[1];
    line = parseInt(urlMatch[2], 10) || line;
  }
  return { file, line };
}

function normalizeErrors(rawErrors) {
  const out = [];
  for (const e of rawErrors || []) {
    const message = String(e?.message || e || "").slice(0, 800);
    if (!message) continue;
    const stack = String(e?.stack || "").slice(0, 3000);
    const { file, line } = parseErrorLocation(stack, e?.file);
    const nameM = message.match(/^([A-Za-z_$][\w$]*Error|[A-Za-z_$][\w$]*):/);
    out.push({
      kind: e?.phase || "runtime",
      name: nameM ? nameM[1] : (e?.name || "Error"),
      message,
      file,
      line,
      stack,
    });
  }
  return out;
}

function normalizeConsole(raw) {
  const logs = raw?.logs || raw || [];
  return (Array.isArray(logs) ? logs : []).map((l) => ({
    level: String(l?.level || "log"),
    text: String(
      Array.isArray(l?.args) ? l.args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ") : (l?.text ?? "")
    ).slice(0, 2000),
  }));
}

function serializeFinalDom(runtime) {
  try {
    const doc = runtime?.window?.document;
    if (!doc) return "";
    const ser = new (Serializer())();
    const root = doc.documentElement || doc;
    return "<!DOCTYPE html>\n" + ser.serialize(root);
  } catch {
    return "";
  }
}

/**
 * Fetch a page, execute its scripts in the Merkava browser engine, and
 * return runtime results + the post-JS DOM.
 *
 * @param {object} opts
 * @param {string} [opts.url]       page URL (fetch HTML + scripts)
 * @param {string} [opts.html]      raw HTML (scripts resolved against opts.url or merkava://local/)
 * @param {number} [opts.waitMs]    settle time after scripts (default 2500)
 * @param {number} [opts.fetchTimeoutMs] per-request timeout (default 15000)
 * @returns {Promise<{ok, jsErrors[], consoleLogs[], finalHtml, scriptsFetched, scriptsRun, wallMs, version}>}
 */
export async function runPageWithJs(opts = {}) {
  const t0 = Date.now();
  const waitMs = Math.min(Math.max(Number(opts.waitMs ?? DEFAULT_WAIT_MS), 0), 30000);
  const fetchTimeoutMs = Math.min(Math.max(Number(opts.fetchTimeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS), 1000), 60000);
  const baseUrl = opts.url || "http://merkava.local/index.html";

  let html = opts.html || "";
  if (!html && opts.url) html = await fetchText(opts.url, fetchTimeoutMs);
  if (!html) throw new Error("runPageWithJs: need html or url");

  // Fetch external scripts so the engine can execute them.
  const srcs = extractScriptSrcs(html, baseUrl);
  const fetched = await fetchAll(srcs, fetchTimeoutMs);
  const files = { "index.html": html };
  let scriptsFetched = 0;
  for (const [url, code] of Object.entries(fetched)) {
    if (code == null) continue;
    files[url] = code;
    // Also key by path variants so the resolver finds them.
    try {
      const u = new URL(url);
      const p = u.pathname + u.search;
      files[p] = code;
      files[u.pathname] = code;
    } catch { /* ignore */ }
    scriptsFetched++;
  }

  const { simulateBrowser } = sim();
  let out;
  try {
    out = await simulateBrowser(files, "index.html", {
      waitMs,
      url: baseUrl,
      origin: (() => { try { return new URL(baseUrl).origin; } catch { return "http://merkava.local/"; } })(),
    });
  } catch (e) {
    return {
      ok: false,
      jsErrors: [{ kind: "harness", name: "EngineError", message: String((e && e.message) || e).slice(0, 800), file: "<engine>", line: 0, stack: String((e && e.stack) || "").slice(0, 2000) }],
      consoleLogs: [],
      finalHtml: html,
      scriptsFetched,
      scriptsRun: 0,
      wallMs: Date.now() - t0,
      version: VERSION,
    };
  }

  const runtimeErrors = out?.runtime?.errors || [];
  const jsErrors = normalizeErrors(runtimeErrors);
  const consoleLogs = normalizeConsole(out?.console);
  const finalHtml = serializeFinalDom(out?.runtime) || html;

  // Count executed steps from the assembly execution plan.
  let scriptsRun = 0;
  try {
    scriptsRun = (out?.assembly?.html?.executionPlan || []).length;
  } catch { /* ignore */ }

  return {
    ok: jsErrors.length === 0,
    jsErrors,
    consoleLogs,
    finalHtml,
    scriptsFetched,
    scriptsRun,
    wallMs: Date.now() - t0,
    version: VERSION,
  };
}
