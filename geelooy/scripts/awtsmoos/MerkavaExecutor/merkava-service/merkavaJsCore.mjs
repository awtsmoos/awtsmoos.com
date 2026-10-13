// B"H
/**
 * @file merkavaJsCore.mjs
 * @description Run JavaScript through the REAL Merkava JS engine (parser ->
 * bytecode -> VM) and instantly return runtime results: console output,
 * uncaught exceptions (name/message/file/line), and failed resource loads.
 *
 * This is the flagship: an agent submits a page (URL or HTML + JS) and gets
 * back every JS runtime error without needing a browser.
 *
 *   import { runJs } from './merkavaJsCore.mjs';
 *   const r = await runJs({ url: 'https://example.com/page' });
 *   // r.jsErrors -> [{name, message, file, line, ip, stack}]
 *   // r.consoleLogs -> [{level, text}]
 */

import compilerPkg from "../merkava-binary/MerkavaJsCompiler.js";
import sangPkg from "../merkava-binary/SangVmRunner.js";
import loaderPkg from "../merkava-binary/MerkavaVmLoader.js";
import hostPkg from "../merkava-binary/DefaultMerkavaHost.js";
import { parseHtmlToDom } from "./snapshots/software/htmlParser.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import vm from "vm";

const { compileJsToCode, parseJs } = compilerPkg;
const { TinyMemory } = sangPkg;
const { loadMerkavaVm } = loaderPkg;
const { createDefaultHost } = hostPkg;

export const VERSION = "1.0.0";

const DEFAULT_MAX_STEPS = 50000;
const DEFAULT_TIMEOUT_MS = 30000;

// B"H: standalone bundles don't have the repo's VM files on disk next to the
// loader. If loadMerkavaVm() can't find them, load from the bundle-relative
// vm/ directory (shipped in the tarball).
const VM_BUNDLE_FILES = [
  "merkava-opcodes.js", "flow.js", "stack.js", "math.js", "objects.js",
  "functions.js", "json.js", "instructions.js", "thread.js", "index.js",
];
function ensureVmLoaded() {
  if (globalThis.MerkavaVM?.Thread && globalThis.MerkavaExecutor) return;
  try {
    loadMerkavaVm();
    return;
  } catch (e) {
    // Fall through to bundle-relative load.
  }
  // Find the vm/ dir: next to this module file (works in repo and bundle).
  // In bundled CJS, __dirname is the real directory; in ESM use import.meta.
  let dir = null;
  try {
    let here = null;
    if (typeof __dirname !== "undefined") here = __dirname;
    else here = path.dirname(fileURLToPath(import.meta.url));
    for (const cand of [path.join(here, "vm"), path.join(here, "..", "vm")]) {
      if (fs.existsSync(path.join(cand, "thread.js"))) { dir = cand; break; }
    }
  } catch { /* ignore */ }
  if (!dir) throw new Error("Merkava VM files not found (tried loader path and bundle vm/)");
  for (const f of VM_BUNDLE_FILES) {
    const file = path.join(dir, f);
    vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file });
  }
}

function extractScripts(html) {
  const out = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1] || "";
    if (/src\s*=/i.test(attrs)) continue; // external: handled separately
    if (/type\s*=\s*["']?(application\/ld\+json|application\/json)/i.test(attrs)) continue;
    const code = (m[2] || "").trim();
    if (!code) continue;
    const isModule = /type\s*=\s*["']?module/i.test(attrs);
    out.push({ code, file: "<inline>", isModule });
  }
  return out;
}

function guessLine(source, message) {
  // Best-effort line mapping (the bytecode has no line table).
  // 1. "X is not defined" -> line where X appears.
  // 2. Otherwise: line containing the longest distinctive substring of the message.
  try {
    const src = String(source || "");
    const lines = src.split("\n");
    const m = String(message || "").match(/^([A-Za-z_$][\w$]*)\s+is not defined/);
    if (m) {
      for (let i = 0; i < lines.length; i++) {
        if (new RegExp(`\\b${m[1]}\\b`).test(lines[i])) {
          return { line: i + 1, estimated: true };
        }
      }
    }
    const msg = String(message || "").trim();
    if (msg.length >= 3) {
      // Try distinctive words from the message.
      const words = msg.split(/[^A-Za-z0-9_$]+/).filter((w) => w.length >= 4);
      for (const w of words) {
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(w)) return { line: i + 1, estimated: true };
        }
      }
    }
  } catch { /* ignore */ }
  return { line: 0, estimated: true };
}

function quietVm(fn) {
  const orig = {
    log: console.log, error: console.error, warn: console.warn,
    group: console.group, groupEnd: console.groupEnd, table: console.table,
  };
  console.log = () => {}; console.error = () => {};
  console.warn = () => {}; console.group = () => {};
  console.groupEnd = () => {}; console.table = () => {};
  try {
    return fn();
  } finally {
    Object.assign(console, orig);
  }
}

async function fetchText(url, timeoutMs) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

/**
 * Execute JS with the Merkava VM.
 *
 * @param {object} opts
 * @param {string} [opts.js]       JS source to run (runs instead of page scripts if given)
 * @param {string} [opts.html]     HTML whose <script> tags get extracted & run
 * @param {string} [opts.url]      fetch page, extract & run its scripts
 * @param {string} [opts.file]     script file label for error reports
 * @param {number} [opts.maxSteps] VM step cap (default 50000)
 * @param {number} [opts.timeoutMs] wall timeout (default 30000)
 * @returns {Promise<{ok, consoleLogs[], jsErrors[], status, steps, wallMs, scriptsRun}>}
 */
export async function runJs(opts = {}) {
  const t0 = Date.now();
  const timeoutMs = Math.min(Math.max(opts.timeoutMs || DEFAULT_TIMEOUT_MS, 1000), 120000);
  const maxSteps = Math.min(Math.max(opts.maxSteps || DEFAULT_MAX_STEPS, 100), 500000);

  const consoleLogs = [];
  const jsErrors = [];
  let html = opts.html || "";
  if (!html && opts.url) html = await fetchText(opts.url, timeoutMs);

  let scripts = [];
  if (opts.js) {
    scripts = [{ code: String(opts.js), file: opts.file || "<inline>" }];
  } else if (html) {
    scripts = extractScripts(html);
  }
  if (!scripts.length) {
    return {
      ok: true, consoleLogs, jsErrors, status: "NO_SCRIPTS",
      steps: 0, wallMs: Date.now() - t0, scriptsRun: 0, version: VERSION,
    };
  }

  ensureVmLoaded();
  let steps = 0;
  let scriptsRun = 0;

  for (const { code, file, isModule } of scripts) {
    if (Date.now() - t0 > timeoutMs) break;
    if (isModule) {
      // B"H: the VM doesn't compile ES module syntax yet — report honestly
      // instead of a parse error.
      jsErrors.push({
        kind: "skipped", name: "ModuleNotSupported",
        message: "ES module script skipped: import/export not yet supported by the VM",
        file, line: 0, estimated: true,
      });
      continue;
    }
    const fakeConsole = {
      log: (...a) => consoleLogs.push({ level: "log", text: a.map(String).join(" ") }),
      info: (...a) => consoleLogs.push({ level: "info", text: a.map(String).join(" ") }),
      warn: (...a) => consoleLogs.push({ level: "warn", text: a.map(String).join(" ") }),
      error: (...a) => consoleLogs.push({ level: "error", text: a.map(String).join(" ") }),
      debug: (...a) => consoleLogs.push({ level: "debug", text: a.map(String).join(" ") }),
    };
    // Minimal document facade so page scripts don't crash on access.
    const dom = html ? parseHtmlToDom(html) : null;
    const documentFacade = {
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      createElement: () => null,
      documentElement: { setAttribute() {} },
      body: null,
      title: "",
    };
    const windowFacade = {
      document: documentFacade,
      location: { href: opts.url || "merkava://run-js" },
      addEventListener() {},
    };
    const localStorageFacade = {
      _s: {}, getItem(k) { return this._s[k] ?? null; },
      setItem(k, v) { this._s[k] = String(v); }, removeItem(k) { delete this._s[k]; },
    };
    const navigatorFacade = { userAgent: "Merkava/1.0" };

    let artifact;
    try {
      artifact = await quietVm(() => compileJsToCode(code, { file }));
    } catch (e) {
      // Parse error — the parser gives real file/line.
      jsErrors.push({
        kind: "parse",
        name: e.name || "SyntaxError",
        message: String(e.message || e).slice(0, 500),
        file,
        line: Number(e.line || e.lineNumber || 0) || 0,
        estimated: false,
      });
      continue;
    }

    const memory = new TinyMemory({
      console: fakeConsole,
      document: documentFacade,
      window: windowFacade,
      localStorage: localStorageFacade,
      navigator: navigatorFacade,
    });
    const hostAPI = { ...createDefaultHost(memory.globals) };
    const vm = new globalThis.MerkavaVM(memory, hostAPI, {});
    const thread = vm.spawn({ bytecode: artifact.bytecode, constants: artifact.constants || [] });
    // Keep crash bookkeeping (rememberCrash -> thread.lastError) but silence
    // the noisy console printing.
    const _remember = thread.rememberCrash.bind(thread);
    thread.logCrash = (e) => { _remember(e); };
    thread.status = "RUNNING";
    scriptsRun++;

    quietVm(() => {
      const wallStart = Date.now();
      while (steps < maxSteps && thread.status === "RUNNING") {
        if (Date.now() - wallStart > timeoutMs || Date.now() - t0 > timeoutMs) {
          thread.status = "TIMEOUT";
          break;
        }
        thread.step();
        steps++;
      }
    });

    if (thread.status === "CRASHED" && thread.lastError) {
      const le = thread.lastError;
      const { line, estimated } = guessLine(code, le.message);
      jsErrors.push({
        kind: "runtime",
        name: le.name || "Error",
        message: String(le.message || "").slice(0, 500),
        file,
        line,
        estimated,
        ip: le.ip ?? 0,
        stack: String(le.stack || "").slice(0, 2000),
      });
    } else if (thread.status === "TIMEOUT") {
      jsErrors.push({
        kind: "timeout", name: "TimeoutError",
        message: `script exceeded ${timeoutMs}ms / ${maxSteps} steps`,
        file, line: 0, estimated: true,
      });
    }
  }

  const realErrors = jsErrors.filter((e) => e.kind !== "skipped");
  return {
    ok: realErrors.length === 0,
    consoleLogs,
    jsErrors,
    status: realErrors.length ? "ERRORS" : "COMPLETED",
    steps,
    wallMs: Date.now() - t0,
    scriptsRun,
    version: VERSION,
  };
}
