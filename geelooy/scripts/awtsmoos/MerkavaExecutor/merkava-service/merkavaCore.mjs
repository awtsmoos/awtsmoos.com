// B"H
/**
 * @file merkavaCore.mjs
 * @description Self-contained Merkava page-run core. One clean interface used by
 * ALL distribution paths: the standalone CLI bundle, the live HTTP API
 * (POST /api/merkava/run), the tunnel's local API, and the agent SDKs.
 *
 *   import { runPage } from './merkavaCore.mjs';
 *   const r = await runPage({ url: 'https://awtsmoos.com', device: 'iphone14',
 *                             actions: 'shot;assert:visible:body' });
 *   // r.png -> Buffer, r.consoleLogs -> [], r.jsErrors -> [], ...
 *
 * NOTE: the software renderer executes page <script>s through the real
 * Merkava browser engine (virtual DOM + fetch) before layout (executeJs,
 * default true). consoleLogs/jsErrors carry the engine's captured output,
 * and the screenshot reflects the post-JS DOM.
 */

import { VerifySession, VIEWPORT_PRESETS, parseInteract } from "./snapshots/verifySession.js";
// B"H: jsPageRunner and merkavaJsCore are imported lazily inside runPage()
// (dynamic import) so a missing file can never break module load.

export const VERSION = "1.2.0";
export { VIEWPORT_PRESETS };

const DEFAULT_TIMEOUT_MS = 30000;

function resolveViewport({ viewport, device } = {}) {
  if (device && VIEWPORT_PRESETS[device]) return { ...VIEWPORT_PRESETS[device] };
  if (viewport) {
    const m = String(viewport).match(/(\d+)\s*x\s*(\d+)/i);
    if (m) return { width: +m[1], height: +m[2], dpr: 1, label: "custom" };
  }
  return { ...VIEWPORT_PRESETS.desktop };
}

async function fetchHtml(url, timeoutMs) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Merkava/1.0 (screenshot)" },
      signal: ctl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function injectCss(html, css) {
  if (!css) return html;
  const tag = `<style data-merkava-injected="1">${css}</style>`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, tag + "</head>");
  return tag + html;
}

function finalDomState(sess, html, jsExecuted) {
  // Lightweight, honest snapshot of what the renderer actually parsed.
  const dom = sess._dom || null;
  let textLength = 0;
  let nodeCount = 0;
  try {
    const walk = (n) => {
      if (!n || typeof n !== "object") return;
      nodeCount++;
      const tag = String(n.localName || n.tagName || "").toLowerCase();
      if (n.nodeType === 3) {
        textLength += String(n.textContent || "").length;
      } else if (tag !== "style" && tag !== "script") {
        for (const ch of n.children || []) walk(ch);
      }
    };
    walk(dom);
  } catch { /* best-effort only */ }
  let title = "";
  try {
    const m = String(html || "").match(/<title[^>]*>([\s\S]{0,200})<\/title>/i);
    if (m) title = m[1].replace(/<[^>]*>/g, "").trim();
  } catch { /* ignore */ }
  return { title, textLength, nodeCount, jsExecuted: !!jsExecuted };
}

/**
 * Run a page through Merkava's software renderer.
 *
 * @param {object} opts
 * @param {string} [opts.html]      raw HTML (one of html/url required)
 * @param {string} [opts.url]       fetch HTML from URL
 * @param {string} [opts.css]       extra CSS injected as a <style> block
 * @param {string} [opts.js]        raw JS snippet (wrapped in a minimal page, run via engine)
 * @param {number} [opts.waitMs]    post-script settle time for page runs (default 2500)
 * @param {string} [opts.device]    viewport preset (iphone14, pixel8, desktop, ...)
 * @param {string} [opts.viewport]  "WxH" custom viewport, overrides device size
 * @param {string|string[]} [opts.actions] interact script ("shot;click:.x") or steps
 * @param {number} [opts.timeoutMs] overall timeout (default 30000)
 * @param {number} [opts.pngLevel]  zlib level 0-9 (1 = fast)
 * @param {boolean} [opts.executeJs] run page <script>s through the Merkava VM
 *   before layout (default true). Captures console + runtime errors.
 * @returns {Promise<{png:Buffer,width,height,consoleLogs:[],jsErrors:[],
 *           finalDom,assertions,timingsMs,ok}>}
 */
export async function runPage(opts = {}) {
  const t0 = Date.now();
  const timeoutMs = Math.min(Math.max(opts.timeoutMs || DEFAULT_TIMEOUT_MS, 1000), 120000);
  let html = opts.html || "";
  if (!html && opts.url) html = await fetchHtml(opts.url, timeoutMs);
  if (!html) throw new Error("runPage: need html or url");
  html = injectCss(html, opts.css);

  // B"H: genuinely run the page — execute scripts through the real Merkava
  // browser engine (virtual DOM + fetch) before layout, so JS-driven DOM
  // updates actually render. Raw JS snippets are wrapped in a minimal page.
  // (Lazy import: a missing engine file degrades to static render, never a crash.)
  let jsResult = null;
  if (opts.executeJs !== false) {
    try {
      const { runPageWithJs } = await import("./snapshots/jsPageRunner.js");
      let pageHtml = html;
      if (opts.js && !html && !opts.url) {
        pageHtml = `<!DOCTYPE html><html><body><script>${opts.js}</script></body></html>`;
      }
      jsResult = await runPageWithJs({
        html: pageHtml || undefined,
        url: opts.url || undefined,
        waitMs: Math.min(opts.waitMs || 2500, 15000),
        fetchTimeoutMs: Math.min(timeoutMs, 15000),
      });
      // Render the POST-JS DOM — this is what makes JS apps screenshot correctly.
      if (!opts.js && jsResult.finalHtml && jsResult.finalHtml.length > html.length / 2) {
        html = injectCss(jsResult.finalHtml, opts.css);
      }
    } catch (e) {
      jsResult = { ok: false, consoleLogs: [], jsErrors: [{ kind: "harness", name: "JsHarnessError", message: String((e && e.message) || e).slice(0, 200), file: "<harness>", line: 0, estimated: true }], status: "HARNESS_ERROR", steps: 0, wallMs: 0, scriptsRun: 0 };
    }
  }

  const v = resolveViewport(opts);
  const sess = new VerifySession(html, {
    width: v.width,
    height: v.height,
    dpr: v.dpr,
    pngLevel: opts.pngLevel != null ? opts.pngLevel : 1,
  });

  const steps = typeof opts.actions === "string" ? parseInteract(opts.actions)
    : Array.isArray(opts.actions) ? opts.actions
    : [{ op: "shot", arg: "", raw: "shot" }];

  // Guarantee at least one screenshot so png is always populated.
  if (!steps.some((s) => s.op === "shot")) steps.push({ op: "shot", arg: "", raw: "shot" });

  const report = await sess.runSteps(steps);
  // renderFrame() gives PNG bytes in memory (shot steps also save files).
  const frame = sess.renderFrame();
  if (!frame || !frame.png || !frame.png.length) throw new Error("runPage: renderer produced no screenshot");

  return {
    ok: report.ok,
    png: Buffer.from(frame.png),
    width: v.width,
    height: v.height,
    dpr: v.dpr,
    consoleLogs: jsResult ? jsResult.consoleLogs : [],
    jsErrors: jsResult ? jsResult.jsErrors : [],
    jsStatus: jsResult ? jsResult.status : "SKIPPED",
    finalDom: finalDomState(sess, html, jsResult && jsResult.status !== "SKIPPED"),
    assertions: report.steps.map((s) => ({
      op: s.op, arg: s.arg || "", ok: !!s.ok, ms: s.ms || 0, detail: String(s.detail || "").slice(0, 300),
    })),
    timingsMs: {
      total: Date.now() - t0,
      layout: sess.timings.layout || 0,
      paint: sess.timings.paint || 0,
      encode: sess.timings.encode || 0,
      renders: sess.timings.renders || 0,
    },
    version: VERSION,
  };
}
