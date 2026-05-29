// B"H
/**
 * @file index.js
 * @description Chapter 73: the page gate forces the newly instrumented ikar
 * starter to execute. The Awtsmoos does not trust an old module instance; the
 * boot key changes, the import runs now, and every failure becomes visible JSON.
 */
const IKAR_VERSION = "boot-phases-20260529-bh73";
let bootStarted = false;

/** @param {unknown} value Any thrown value. @param {number} depth Recursion depth. @returns {unknown} JSON-safe value. */
function safeClone(value, depth = 0) {
  if (depth > 4) return "[MaxDepth]";
  if (value == null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;
  if (value instanceof Error) return cloneError(value, depth);
  if (Array.isArray(value)) return value.slice(0, 40).map(item => safeClone(item, depth + 1));
  if (typeof value === "object") return cloneObject(value, depth);
  return String(value);
}

/** @param {Error} error Error. @param {number} depth Recursion depth. @returns {object} */
function cloneError(error, depth) {
  const out = { kind: "Error", name: error.name, message: error.message, stack: error.stack, cause: safeClone(error.cause, depth + 1) };
  for (const key of Object.keys(error)) out[key] = safeClone(error[key], depth + 1);
  return out;
}

/** @param {object} object Object. @param {number} depth Recursion depth. @returns {object} */
function cloneObject(object, depth) {
  const out = { kind: object?.constructor?.name || "Object", string: String(object) };
  for (const key of Object.keys(object).slice(0, 80)) {
    try { out[key] = safeClone(object[key], depth + 1); }
    catch (error) { out[key] = `[Unreadable: ${error?.message || String(error)}]`; }
  }
  for (const key of ["name", "message", "stack", "code", "type", "status", "url", "line", "column", "filename", "phase", "moduleURL"]) {
    if (out[key] !== undefined) continue;
    try { if (object[key] !== undefined) out[key] = safeClone(object[key], depth + 1); }
    catch {}
  }
  return out;
}

/** @param {object} details Details. @returns {void} */
function storeLastError(details) {
  const scope = typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : globalThis;
  scope.__AWTSMOOS_LAST_ERROR__ = details;
  scope.__AWTSMOOS_LAST_ERROR_JSON__ = JSON.stringify(details, null, 2);
}

/** @param {object} details Details. @returns {void} */
function renderErrorPanel(details) {
  if (typeof document === "undefined") return;
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

/** @param {unknown} error Error object. @param {object} context Context. @returns {object} */
function describeAwtsmoosError(error, context = {}) {
  const details = { context: safeClone(context), thrown: safeClone(error), at: new Date().toISOString(), page: globalThis.location?.href || null };
  console.error(`B"H - ${context.label || "Runtime error"} JSON`, JSON.stringify(details, null, 2));
  console.error(`B"H - ${context.label || "Runtime error"} OBJECT`, details);
  storeLastError(details);
  renderErrorPanel(details);
  return details;
}

/** @returns {void} Imports the visual/runtime starter once. */
function bootIkarNow() {
  if (bootStarted || typeof window === "undefined" || !window.document) return;
  bootStarted = true;
  window.__AWTSMOOS_BOOT_STARTED__ = { at: new Date().toISOString(), version: IKAR_VERSION, readyState: document.readyState };
  const ikarModuleURL = `./ckidsAwtsmoos/ikar.js?v=${IKAR_VERSION}`;
  import(ikarModuleURL).then(module => {
    window.__AWTSMOOS_BOOT_LOADED__ = { at: new Date().toISOString(), keys: Object.keys(module || {}) };
    console.log("B\"H - Mitzvah World ikar boot loaded", window.__AWTSMOOS_BOOT_LOADED__);
  }).catch(error => describeAwtsmoosError(error, { label: "Index [Main]: Failed to load UI starter", phase: "dynamic import", moduleURL: new URL(ikarModuleURL, import.meta.url).href }));
}

if (typeof window !== "undefined") {
  window.addEventListener("error", event => describeAwtsmoosError(event.error || event.message, { label: "Global error", phase: "window.error", moduleURL: event.filename, line: event.lineno, column: event.colno }));
  window.addEventListener("unhandledrejection", event => describeAwtsmoosError(event.reason, { label: "Unhandled promise rejection", phase: "window.unhandledrejection" }));
}

export async function heescheel(ctx) { console.log("B\"H - Index [Worker]: data-driven level hook.", Boolean(ctx)); }
export function ready(ctx) { ctx.postMsg({ type: "game started", payload: true }); }
export function afterBriyah(ctx) { console.log("B\"H - Index [Worker]: afterBriyah() called", Boolean(ctx)); }

if (typeof window !== "undefined" && window.document) {
  if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", bootIkarNow, { once: true });
  else bootIkarNow();
}
