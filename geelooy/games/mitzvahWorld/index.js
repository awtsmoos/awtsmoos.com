// B"H
/**
 * @file index.js
 * @description
 * Chapter 2: The page gate forgets old cached whispers.
 *
 * This entry only loads the lean UI/world starter on the main thread. When the
 * worker imports this shared file, the lifecycle hooks stay inert so no legacy
 * default world is generated behind Level 1.
 */
const IKAR_VERSION = "lean-l1-20260528-bh6";

/** Stores the last useful error on the available global vessel. */
function storeLastError(details) {
  if (typeof window !== "undefined") window.__AWTSMOOS_LAST_ERROR__ = details;
  else if (typeof self !== "undefined") self.__AWTSMOOS_LAST_ERROR__ = details;
}

/** Reports a runtime error without triggering old startup systems. */
function describeAwtsmoosError(error, context = {}) {
  const details = {
    context,
    name: error?.name,
    message: error?.message || String(error),
    stack: error?.stack,
    cause: error?.cause
  };
  console.error(`B"H - ${context.label || "Runtime error"}`, details);
  storeLastError(details);
  return details;
}

if (typeof window !== "undefined") {
  window.addEventListener("error", event => describeAwtsmoosError(event.error || event.message, {
    label: "Global error",
    phase: "window.error",
    moduleURL: event.filename,
    line: event.lineno,
    column: event.colno
  }));
  window.addEventListener("unhandledrejection", event => describeAwtsmoosError(event.reason, {
    label: "Unhandled promise rejection",
    phase: "window.unhandledrejection"
  }));
}

/** Worker hook: intentionally no default world generation. */
export async function heescheel(ctx) {
  console.log("B\"H - Index [Worker]: lean data-driven level hook.", !!ctx);
}

/** Worker ready hook. */
export function ready(ctx) {
  ctx.postMsg({ type: "game started", payload: true });
}

/** Worker post-creation hook. */
export function afterBriyah(ctx) {
  console.log("B\"H - Index [Worker]: afterBriyah() called", !!ctx);
}

if (typeof window !== "undefined" && window.document) {
  window.addEventListener("DOMContentLoaded", () => {
    const ikarModuleURL = `./ckidsAwtsmoos/ikar.js?v=${IKAR_VERSION}`;
    import(ikarModuleURL).catch(error => describeAwtsmoosError(error, {
      label: "Index [Main]: Failed to load lean UI starter",
      phase: "dynamic import",
      moduleURL: new URL(ikarModuleURL, import.meta.url).href
    }));
  });
}
