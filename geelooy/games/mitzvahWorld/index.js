// B"H
/**
 * @file index.js
 * @description Chapter 17: Page gate opens bh21 reset overlay, compact HUD, and retractable inventory.
 */
const IKAR_VERSION = "lean-l1-20260528-bh28";

function storeLastError(details) {
  if (typeof window !== "undefined") window.__AWTSMOOS_LAST_ERROR__ = details;
  else if (typeof self !== "undefined") self.__AWTSMOOS_LAST_ERROR__ = details;
}

function describeAwtsmoosError(error, context = {}) {
  const details = { context, name: error?.name, message: error?.message || String(error), stack: error?.stack, cause: error?.cause };
  console.error(`B"H - ${context.label || "Runtime error"}`, details);
  storeLastError(details);
  return details;
}

if (typeof window !== "undefined") {
  window.addEventListener("error", event => describeAwtsmoosError(event.error || event.message, { label: "Global error", phase: "window.error", moduleURL: event.filename, line: event.lineno, column: event.colno }));
  window.addEventListener("unhandledrejection", event => describeAwtsmoosError(event.reason, { label: "Unhandled promise rejection", phase: "window.unhandledrejection" }));
}

export async function heescheel(ctx) { console.log("B\"H - Index [Worker]: data-driven level hook.", !!ctx); }
export function ready(ctx) { ctx.postMsg({ type: "game started", payload: true }); }
export function afterBriyah(ctx) { console.log("B\"H - Index [Worker]: afterBriyah() called", !!ctx); }

if (typeof window !== "undefined" && window.document) {
  window.addEventListener("DOMContentLoaded", () => {
    const ikarModuleURL = `./ckidsAwtsmoos/ikar.js?v=${IKAR_VERSION}`;
    import(ikarModuleURL).catch(error => describeAwtsmoosError(error, { label: "Index [Main]: Failed to load UI starter", phase: "dynamic import", moduleURL: new URL(ikarModuleURL, import.meta.url).href }));
  });
}
