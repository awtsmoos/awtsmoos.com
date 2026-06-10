// B"H
/**
 * @file index.js
 * @description Chapter 619: The outer gate carries the direct lava platform and no
 * invisible village collider seal, forcing the browser to fetch fresh runtime
 * instantiation and visual-only village data.
 */
let bootStarted = false;
const SEAL = "simplified-solid-colliders-20260609-bh636";
const WORKER_WORLD_BUILDER_CONTRACT = "WorldHeescheel";
function safeClone(value, depth = 0) {
  if (depth > 4) return "[MaxDepth]";
  if (value == null || ["string", "number", "boolean"].includes(typeof value)) return value;
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;
  if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack, cause: safeClone(value.cause, depth + 1) };
  if (Array.isArray(value)) return value.slice(0, 40).map(item => safeClone(item, depth + 1));
  if (typeof value === "object") {
    const out = { kind: value?.constructor?.name || "Object", string: String(value) };
    for (const key of Object.keys(value).slice(0, 80)) {
      try { out[key] = safeClone(value[key], depth + 1); }
      catch (error) { out[key] = `[Unreadable: ${error?.message || String(error)}]`; }
    }
    return out;
  }
  return String(value);
}
function renderErrorPanel(details) {
  const root = document.getElementById("ikar") || document.body;
  if (!root) return;
  let panel = document.getElementById("awtsmoosBootErrorPanel");
  if (!panel) {
    panel = document.createElement("pre");
    panel.id = "awtsmoosBootErrorPanel";
    panel.style.cssText = "position:fixed;inset:12px;z-index:999999;padding:16px;overflow:auto;white-space:pre-wrap;background:#190000;color:#ffd7a0;border:2px solid #ff6b2a;font:13px/1.4 monospace;";
    root.appendChild(panel);
  }
  panel.textContent = `B\"H — Mitzvah World boot error\n\n${JSON.stringify(details, null, 2)}`;
}
function describeAwtsmoosError(error, context = {}) {
  const details = { context: safeClone(context), thrown: safeClone(error), at: new Date().toISOString(), page: location?.href || null };
  console.error(`B"H - ${context.label || "Runtime error"} JSON`, JSON.stringify(details, null, 2));
  window.__AWTSMOOS_LAST_ERROR__ = details;
  window.__AWTSMOOS_LAST_ERROR_JSON__ = JSON.stringify(details, null, 2);
  renderErrorPanel(details);
  return details;
}
function bootIkarNow() {
  if (bootStarted || typeof window === "undefined" || !window.document) return;
  bootStarted = true;
  window.__AWTSMOOS_BOOT_STARTED__ = { at: new Date().toISOString(), readyState: document.readyState, seal: SEAL };
  const ikarModuleURL = `./ckidsAwtsmoos/ikar.js?bh=${SEAL}`;
  import(ikarModuleURL).then(module => {
    window.__AWTSMOOS_BOOT_LOADED__ = { at: new Date().toISOString(), keys: Object.keys(module || {}), seal: SEAL };
    console.log("B\"H - Mitzvah World ikar boot loaded", window.__AWTSMOOS_BOOT_LOADED__);
  }).catch(error => describeAwtsmoosError(error, { label: "Index [Main]: Failed to load UI starter", phase: "dynamic import", moduleURL: new URL(ikarModuleURL, import.meta.url).href }));
}
window.addEventListener("error", event => describeAwtsmoosError(event.error || event.message, { label: "Global error", phase: "window.error", moduleURL: event.filename, line: event.lineno, column: event.colno }));
window.addEventListener("unhandledrejection", event => describeAwtsmoosError(event.reason, { label: "Unhandled promise rejection", phase: "window.unhandledrejection" }));
export async function heescheel(ctx) { console.log("B\"H - Index [Worker]: data-driven level hook.", Boolean(ctx)); }
export function ready(ctx) { ctx.postMsg({ type: "game started", payload: true }); }
export function afterBriyah(ctx) { console.log("B\"H - Index [Worker]: afterBriyah() called", Boolean(ctx)); }
if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", bootIkarNow, { once: true });
else bootIkarNow();
