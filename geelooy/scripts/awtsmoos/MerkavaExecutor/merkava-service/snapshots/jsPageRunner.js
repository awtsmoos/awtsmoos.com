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

import { fileURLToPath } from "url";
import path from "path";
// B"H: static imports — CJS/UMD engine modules via default interop;
// bundlers (esbuild) follow these, unlike createRequire.
import simPkg from "../../merkava-runtime/UnifiedSimulation.js";
import serPkg from "../../merkava-browser/VirtualHtmlSerializer.js";

const { simulateBrowser } = simPkg;
const VirtualHtmlSerializer = serPkg?.VirtualHtmlSerializer || serPkg;

const __here = path.dirname(fileURLToPath(import.meta.url));

export const VERSION = "1.2.0";
const DEFAULT_WAIT_MS = 2500;
const DEFAULT_FETCH_TIMEOUT_MS = 15000;
const MAX_SCRIPTS = 60;
const FETCH_CONCURRENCY = 6;
// B"H 2026-10-13: depth 16, not 8. Game trees run deep — cobyk's kinetics
// state module sits at static depth 9 (main -> app -> session -> kinetics),
// and with `while (depth < MAX)` the loop fetches level N but only crawls
// imports of levels below N, so depth-9 modules were never fetched at all
// ("VM module not found"). 16 covers real game trees; MAX_TOTAL_MODULES
// still bounds the worst case.
const MAX_MODULE_DEPTH = 16;
const MAX_TOTAL_MODULES = 600;

/** Extract inline module scripts (no src) so their imports get crawled too. */
function extractInlineModules(html) {
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1] || "";
    const code = m[2] || "";
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const typeM = attrs.match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const type = (typeM?.[1] ?? typeM?.[2] ?? typeM?.[3] ?? "").toLowerCase();
    if (type && type !== "module") continue; // only classic-inline or module-inline
    if (!/\bimport\b|\bexport\b/.test(code)) continue;
    out.push(code);
    if (out.length >= 20) break;
  }
  return out;
}
function extractImportMap(html, baseUrl) {
  const out = { imports: {}, scopes: {} };
  try {
    const re = /<script\b[^>]*\btype\s*=\s*(?:"importmap"|'importmap'|importmap)[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html))) {
      try {
        const parsed = JSON.parse(m[1]);
        if (parsed && typeof parsed === "object") {
          Object.assign(out.imports, parsed.imports || {});
          Object.assign(out.scopes, parsed.scopes || {});
        }
      } catch { /* malformed importmap: ignore */ }
    }
  } catch { /* never fail the run on importmap parsing */ }
  return out;
}

/** Find module specifiers inside a script: static import/export + literal dynamic import(). */
function extractImportSpecifiers(code) {
  const out = [];
  const seen = new Set();
  const clean = String(code || "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
  const push = (s) => {
    if (!s || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };
  // static: import x from "s" | import "s" | export ... from "s"
  const staticRe = /\b(?:import|export)\b[^;"']*?\bfrom\s*(?:"([^"]+)"|'([^']+)')/g;
  let m;
  while ((m = staticRe.exec(clean))) push(m[1] ?? m[2]);
  const sideRe = /\bimport\s*(?:"([^"]+)"|'([^']+)')/g;
  while ((m = sideRe.exec(clean))) push(m[1] ?? m[2]);
  // dynamic: import("s") with literal
  const dynRe = /\bimport\s*\(\s*(?:"([^"]+)"|'([^']+)')\s*\)/g;
  while ((m = dynRe.exec(clean))) push(m[1] ?? m[2]);
  return out;
}

/** Resolve a module specifier to an absolute URL using the importmap, else URL resolution. */
function resolveModuleUrl(spec, fromUrl, importMap) {
  const raw = String(spec || "").trim();
  if (!raw || raw.startsWith("data:") || raw.startsWith("blob:")) return null;
  // Bare specifier: try importmap first.
  if (!raw.startsWith("/") && !raw.startsWith(".") && !/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    const mapped = importMap?.imports?.[raw];
    if (mapped) {
      try { return new URL(mapped, fromUrl).href; } catch { return null; }
    }
    // importmap prefix mappings (keys ending in /)
    const prefixes = Object.keys(importMap?.imports || {}).filter((k) => k.endsWith("/")).sort((a, b) => b.length - a.length);
    for (const p of prefixes) {
      if (raw.startsWith(p)) {
        try { return new URL(importMap.imports[p] + raw.slice(p.length), fromUrl).href; } catch { /* continue */ }
      }
    }
    return null; // unknown bare specifier (npm package): engine handles or reports
  }
  try {
    return new URL(raw, fromUrl).href;
  } catch { return null; }
}

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

async function fetchText(url, timeoutMs, redirectDepth = 0) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      redirect: "manual",
      headers: { "User-Agent": "Merkava/1.0 (page-runner)" },
    });
    // B"H: follow redirects manually (3xx) so /feed -> /feed/ works.
    if (res.status >= 300 && res.status < 400 && redirectDepth < 5) {
      const loc = res.headers.get("location");
      if (loc) {
        const next = new URL(loc, url).href;
        return fetchText(next, timeoutMs, redirectDepth + 1);
      }
    }
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

/**
 * B"H 2026-11-11: how the injected script's value gets home. The engine
 * executes a page's external scripts in their own assembled context —
 * page state (e.g. window.SC) lives THERE, not on the runtime facade's
 * window that this runner gets back, and not in the serialized DOM (a
 * separate late "function" evaluation gets yet another facade). Guest
 * fetch has no live transport in this lane, but VirtualFetch RECORDS
 * every request (resolved or not) on the window's network log, which
 * the runner CAN read back. So the wrapper — appended to the page's
 * LAST fetched script, running in the page's own context after all
 * page scripts — evaluates the caller's script (as the body of an
 * async function; top-level `return` works, promises are awaited) and
 * encodes the outcome into one fetch URL, where the runner finds it
 * in the recorded requests. Pages with no external scripts fall back
 * to an inline <script> at the end of <body>.
 */
function buildInjectedWrapper(js, resultToken) {
  const code = String(js);
  return `
;(async () => {
  const __send = async (payload) => {
    try {
      let __s = JSON.stringify(payload);
      let __b = btoa(unescape(encodeURIComponent(__s))).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, "");
      if (__b.length > 24000) {
        __s = JSON.stringify({ nonSerializable: true, type: "oversized", summary: "injected script result exceeded the 24K transport cap" });
        __b = btoa(unescape(encodeURIComponent(__s))).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, "");
      }
      await fetch("/__merkava_result_${resultToken}/" + __b);
    } catch (e) { /* recorded-request transport is best-effort */ }
  };
  try {
    const __v = await (async () => {
${code}
    })();
    if (typeof __v === "undefined") { await __send({ wasUndefined: true }); return; }
    let __s = null;
    try { __s = JSON.stringify(__v); } catch (e) { __s = null; }
    if (__s == null || typeof __s === "undefined") {
      let __sum = "";
      try { __sum = String(__v).slice(0, 500); } catch (e) { /* ignore */ }
      await __send({ nonSerializable: true, type: Array.isArray(__v) ? "array" : typeof __v, summary: __sum });
    } else {
      await __send({ value: JSON.parse(__s) });
    }
  } catch (e) {
    await __send({ error: {
      name: (e && e.name) || "Error",
      message: String((e && e.message) || e),
      stack: String((e && e.stack) || ""),
    } });
  }
})();
`;
}

/** Read a wrapper payload back out of the window's recorded requests. */
function readInjectedPayload(runtime, resultToken) {
  try {
    const reqs = runtime?.window?.__network?.requests || [];
    const marker = "/__merkava_result_" + resultToken + "/";
    for (let i = reqs.length - 1; i >= 0; i--) {
      const url = String(reqs[i]?.url || "");
      const at = url.indexOf(marker);
      if (at < 0) continue;
      const b64 = url.slice(at + marker.length).split(/[?#]/)[0];
      const json = Buffer.from(b64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
      return JSON.parse(json);
    }
  } catch { /* no usable payload */ }
  return null;
}

function injectScriptTag(html, code) {
  const tag = `<script>\n${code}\n</script>`;
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, tag + "</body>");
  return html + tag;
}

/**
 * Make an injected script's completion value safe to hand back: JSON
 * round-trip when possible; otherwise a typed summary. Never throws.
 */
function safeSerializeScriptResult(v) {
  if (typeof v === "undefined") return undefined;
  try {
    const s = JSON.stringify(v);
    if (typeof s === "undefined") throw new Error("not JSON-serializable");
    return JSON.parse(s);
  } catch {
    let summary = "";
    try { summary = String(v).slice(0, 500); } catch { /* ignore */ }
    return {
      __nonSerializable: true,
      type: Array.isArray(v) ? "array" : typeof v,
      summary,
    };
  }
}

function serializeFinalDom(runtime) {
  try {
    const doc = runtime?.window?.document;
    if (!doc) return "";
    const ser = new VirtualHtmlSerializer();
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
 * @param {string} [opts.js]        extra script appended as the page's last
 *   script and run in its context, as the body of an async function
 *   (top-level `return` works). Its completion value comes back as
 *   `scriptResult`; a throw is captured into jsErrors. The script settles
 *   within the simulation's waitMs window.
 * @param {number} [opts.waitMs]    settle time after scripts (default 2500)
 * @param {number} [opts.fetchTimeoutMs] per-request timeout (default 15000)
 * @returns {Promise<{ok, status, scriptResult, jsErrors[], consoleLogs[], finalHtml, canvasSnapshot, scriptsFetched, scriptsRun, wallMs, version}>}
 */
export async function runPageWithJs(opts = {}) {
  const t0 = Date.now();
  const waitMs = Math.min(Math.max(Number(opts.waitMs ?? DEFAULT_WAIT_MS), 0), 30000);
  const fetchTimeoutMs = Math.min(Math.max(Number(opts.fetchTimeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS), 1000), 60000);
  const baseUrl = opts.url || "http://merkava.local/index.html";

  let html = opts.html || "";
  if (!html && opts.url) html = await fetchText(opts.url, fetchTimeoutMs);
  if (!html) throw new Error("runPageWithJs: need html or url");
  const hasInjected = typeof opts.js === "string" && opts.js.length > 0;

  // Fetch external scripts so the engine can execute them.
  const srcs = extractScriptSrcs(html, baseUrl);
  const fetched = await fetchAll(srcs, fetchTimeoutMs);
  const files = { "index.html": html };
  let scriptsFetched = 0;

  // B"H: recursively fetch imported modules so the engine never hits
  // "VM module not found" for a real file that exists on the server.
  const importMap = extractImportMap(html, baseUrl);
  const seenUrls = new Set(srcs);
  const codeByUrl = {};
  const keyFile = (url, code) => {
    files[url] = code;
    try {
      const u = new URL(url);
      const p = u.pathname + u.search;
      files[p] = code;
      files[u.pathname] = code;
    } catch { /* ignore */ }
  };
  const fetchModuleTree = async () => {
    let depth = 0;
    let pending = Object.entries(fetched)
      .filter(([, code]) => code != null)
      .map(([url, code]) => ({ url, code }));
    for (const { url, code } of pending) {
      codeByUrl[url] = code;
      keyFile(url, code);
      scriptsFetched++;
    }
    // B"H: inline module scripts also import files — crawl their specifiers.
    for (const inlineCode of extractInlineModules(html)) {
      for (const spec of extractImportSpecifiers(inlineCode)) {
        const resolved = resolveModuleUrl(spec, baseUrl, importMap);
        if (!resolved || seenUrls.has(resolved)) continue;
        try {
          if (new URL(resolved).origin !== new URL(baseUrl).origin) continue;
        } catch { continue; }
        seenUrls.add(resolved);
        try {
          const code = await fetchText(resolved, fetchTimeoutMs);
          codeByUrl[resolved] = code;
          keyFile(resolved, code);
          scriptsFetched++;
          pending.push({ url: resolved, code });
        } catch { /* missing: engine reports it */ }
      }
    }
    while (depth < MAX_MODULE_DEPTH && pending.length && scriptsFetched < MAX_TOTAL_MODULES) {
      depth++;
      const next = [];
      for (const { url, code } of pending) {
        for (const spec of extractImportSpecifiers(code)) {
          const resolved = resolveModuleUrl(spec, url, importMap);
          if (!resolved || seenUrls.has(resolved)) continue;
          // Only crawl same-origin modules; cross-origin is fetched on demand by the engine.
          try {
            if (new URL(resolved).origin !== new URL(baseUrl).origin) continue;
          } catch { continue; }
          seenUrls.add(resolved);
          next.push(resolved);
        }
      }
      if (!next.length) break;
      const results = await fetchAll(next, fetchTimeoutMs);
      pending = [];
      for (const [url, code] of Object.entries(results)) {
        if (code == null) continue; // missing: engine reports it; don't hard-fail
        codeByUrl[url] = code;
        keyFile(url, code);
        scriptsFetched++;
        pending.push({ url, code });
      }
    }
  };
  await fetchModuleTree();

  // B"H 2026-11-11: inject the caller's script (see buildInjectedWrapper).
  // The wrapper is appended to the page's last fetched external script so
  // it runs in the page's real script context; with no external scripts it
  // goes inline at the end of <body> instead.
  const resultToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
  if (hasInjected) {
    const wrapper = buildInjectedWrapper(opts.js, resultToken);
    let hostUrl = null;
    for (let i = srcs.length - 1; i >= 0; i--) {
      if (codeByUrl[srcs[i]] != null) { hostUrl = srcs[i]; break; }
    }
    if (hostUrl) {
      const original = codeByUrl[hostUrl];
      const augmented = original + "\n" + wrapper;
      for (const k of Object.keys(files)) {
        if (files[k] === original) files[k] = augmented;
      }
      codeByUrl[hostUrl] = augmented;
    } else {
      html = injectScriptTag(html, wrapper);
      files["index.html"] = html;
    }
  }

  let out;
  try {
    out = await simulateBrowser(files, "index.html", {
      waitMs,
      url: baseUrl,
      // B"H 2026-11-11: the engine resolves script srcs against this
      // origin (RuntimeAddress), so it must be the page's DIRECTORY —
      // a bare origin silently resolves every src to the server root,
      // and pages under a subpath execute zero scripts while reporting
      // success. (Root-level pages are unaffected: "." of /index.html
      // is the origin root either way.)
      origin: (() => { try { return new URL(".", baseUrl).href; } catch { return "http://merkava.local/"; } })(),
    });
  } catch (e) {
    return {
      ok: false,
      status: "ERROR",
      scriptResult: undefined,
      jsErrors: [{ kind: "harness", name: "EngineError", message: String((e && e.message) || e).slice(0, 800), file: "<engine>", line: 0, stack: String((e && e.stack) || "").slice(0, 2000) }],
      consoleLogs: [],
      finalHtml: html,
      canvasSnapshot: null,
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

  // B"H 2026-11-11: collect the injected script's outcome from the
  // window's recorded network requests (see buildInjectedWrapper). A
  // throwing script never breaks the page run — its error joins
  // jsErrors (kind "injected") and flips ok/status. If no result
  // request was recorded, the injection is reported as an
  // InjectionError.
  let scriptResult;
  if (hasInjected) {
    const payload = readInjectedPayload(out?.runtime, resultToken);
    if (payload && payload.error) {
      jsErrors.push(...normalizeErrors([{ ...payload.error, phase: "injected", file: "<injected>" }]));
    } else if (payload && payload.nonSerializable) {
      scriptResult = { __nonSerializable: true, type: payload.type, summary: payload.summary };
    } else if (payload && "value" in payload) {
      scriptResult = safeSerializeScriptResult(payload.value);
    } else if (payload && payload.wasUndefined) {
      scriptResult = undefined;
    } else {
      jsErrors.push({
        kind: "injected",
        name: "InjectionError",
        message: "injected script produced no result (did not run, or did not settle during the simulation)",
        file: "<injected>",
        line: 0,
        stack: "",
      });
    }
  }

  // B"H 2026-10-13: capture the document's texture arena so the shot path
  // can paint real canvas pixels (2D command replay + WebGL glPixels).
  let canvasSnapshot = null;
  try {
    const arena = out?.runtime?.window?.document?.textureArena;
    if (arena && typeof arena.snapshot === 'function') canvasSnapshot = arena.snapshot();
  } catch { /* arena unavailable: screenshots fall back to DOM-only */ }

  // Count executed steps from the assembly execution plan.
  let scriptsRun = 0;
  try {
    scriptsRun = (out?.assembly?.html?.executionPlan || []).length;
  } catch { /* ignore */ }

  return {
    ok: jsErrors.length === 0,
    status: jsErrors.length === 0 ? "OK" : "ERROR",
    scriptResult,
    jsErrors,
    consoleLogs,
    finalHtml,
    canvasSnapshot,
    scriptsFetched,
    scriptsRun,
    wallMs: Date.now() - t0,
    version: VERSION,
  };
}
