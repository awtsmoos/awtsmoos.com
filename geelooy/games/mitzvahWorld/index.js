/**
 * B"H
 * @file index.js
 * @description
 * THE UNIVERSAL ENTRY.
 *
 * Dual-purpose:
 * - main thread: loads UI/menu coordinator
 * - worker-loaded game module: exports lifecycle hooks
 *
 * Fixes:
 * - no unsafe window usage in shared code
 * - better error storage in window or self
 * - relative import for Mitzvah World builder, reducing root-path fragility
 */

console.log("B\"H - Index: Manifesting at top-level...");

import { WorldHeescheel } from "./ckidsAwtsmoos/Olam/worlds/mitzvahWorld/WorldHeescheel.js";

/**
 * B"H
 * Stores last error wherever this realm allows.
 *
 * @param {Object} details
 * Error details.
 *
 * @returns {void}
 */
function storeLastError(details) {
  if (typeof window !== "undefined") {
    window.__AWTSMOOS_LAST_ERROR__ = details;
    return;
  }

  if (typeof self !== "undefined") {
    self.__AWTSMOOS_LAST_ERROR__ = details;
  }
}

/**
 * B"H
 * Describes runtime errors with useful details.
 *
 * @param {unknown} err
 * Error or thrown value.
 *
 * @param {Object} context
 * Context object.
 *
 * @returns {Object}
 * Error details.
 */
function describeAwtsmoosError(err, context = {}) {
  const details = {
    context,
    name: err?.name,
    message: err?.message || String(err),
    stack: err?.stack,
    cause: err?.cause,
    error: err
  };

  if (err instanceof Error) {
    console.groupCollapsed(
      `B"H - ${context.label || "Runtime error"}: ${err.name}: ${err.message}`
    );
    console.error(err);
    console.table({
      module: context.moduleURL || "(unknown)",
      phase: context.phase || "(unknown)",
      name: err.name,
      message: err.message
    });
    if (err.stack) console.log(err.stack);
    if (err.cause) console.error("B\"H - Caused by:", err.cause);
    console.groupEnd();
  } else {
    console.error(`B"H - ${context.label || "Runtime error"}:`, details);
  }

  storeLastError(details);
  return details;
}

if (typeof window !== "undefined") {
  window.addEventListener("error", event => {
    describeAwtsmoosError(event.error || event.message, {
      label: "Global error",
      phase: "window.error",
      moduleURL: event.filename,
      line: event.lineno,
      column: event.colno
    });
  });

  window.addEventListener("unhandledrejection", event => {
    describeAwtsmoosError(event.reason, {
      label: "Unhandled promise rejection",
      phase: "window.unhandledrejection"
    });
  });
}

/**
 * B"H
 * Worker entry point.
 *
 * @param {Object} ctx
 * Worker/game context.
 *
 * @returns {Promise<void>}
 */
export async function heescheel(ctx) {
  console.log("B\"H - Index [Worker]: heescheel() called", !!ctx);

  const worldBuilder = new WorldHeescheel({
    scene: ctx.scene,
    physics: ctx.physics || null,
    postMsg: ctx.postMsg,
    olam: ctx.olam || null
  });

  await worldBuilder.execute();
}

/**
 * B"H
 * Worker ready hook.
 *
 * @param {Object} ctx
 * Worker/game context.
 *
 * @returns {void}
 */
export function ready(ctx) {
  console.log("B\"H - Index [Worker]: ready() called");
  ctx.postMsg({ type: "game started", payload: true });
}

/**
 * B"H
 * Post-creation hook.
 *
 * @param {Object} ctx
 * Worker/game context.
 *
 * @returns {void}
 */
export function afterBriyah(ctx) {
  console.log("B\"H - Index [Worker]: afterBriyah() called", ctx);
}

if (typeof window !== "undefined" && window.document) {
  console.log("B\"H - Index [Main]: Detecting Sanctuary of UI...");

  window.addEventListener("DOMContentLoaded", () => {
    console.log("B\"H - Index [Main]: DOM ready. Loading Ikar/Menu logic...");

    const ikarModuleURL = "./ckidsAwtsmoos/ikar.js";

    import(ikarModuleURL)
      .then(module => {
        console.log("B\"H - Index [Main]: Ikar module integrated.");
        return module;
      })
      .catch(error => {
        describeAwtsmoosError(error, {
          label: "Index [Main]: Failed to manifest the UI Chariot",
          phase: "dynamic import",
          moduleURL: new URL(ikarModuleURL, import.meta.url).href
        });
      });
  });
}