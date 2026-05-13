/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE UNIVERSAL ENTRY — index.js
 *   ─────────────────────────────────
 *   Dual-purpose entry point for both Main Thread (UI) and Worker (Engine).
 * ════════════════════════════════════════════════════════════════════════
 */

console.log("B\"H - Index: Manifesting at top-level...");

import { WorldHeescheel } from '/games/mitzvahWorld/ckidsAwtsmoos/Olam/worlds/mitzvahWorld/WorldHeescheel.js';

function describeAwtsmoosError(err, context = {}) {
    const details = {
        context,
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        cause: err?.cause,
        error: err
    };

    if (err instanceof Error) {
        console.groupCollapsed(`B"H - ${context.label || "Runtime error"}: ${err.name}: ${err.message}`);
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

    window.__AWTSMOOS_LAST_ERROR__ = details;
    return details;
}

if (typeof window !== 'undefined') {
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
 * ── WORKER ENTRY POINTS ──
 */
export async function heescheel(ctx) {
  console.log("B\"H - Index [Worker]: heescheel() called", !!ctx);
  const worldBuilder = new WorldHeescheel({
    scene:   ctx.scene,
    physics: ctx.physics || null,
    postMsg: ctx.postMsg,
    olam:    ctx.olam    || null,
  });
  await worldBuilder.execute();
}

export function ready(ctx) {
  console.log("B\"H - Index [Worker]: ready() called");
  ctx.postMsg({ type: 'game started', payload: true });
}

export function afterBriyah(ctx) {
  console.log("B\"H - Index [Worker]: afterBriyah() called");
}

/**
 * ── MAIN THREAD INITIALIZATION (UI / MENU) ──
 */
if (typeof window !== 'undefined' && window.document) {
    console.log("B\"H - Index [Main]: Detecting Sanctuary of UI...");
    
    // We wait for the DOM to be ready before unleashing the UI
    window.addEventListener('DOMContentLoaded', () => {
        console.log("B\"H - Index [Main]: DOM ready. Loading Ikar/Menu logic...");
        
        // Dynamically import the main-thread coordinator
        const ikarModuleURL = './ckidsAwtsmoos/ikar.js';
        import(ikarModuleURL)
            .then(m => {
                console.log("B\"H - Index [Main]: Ikar (UI) module successfully integrated.");
                return m;
            })
            .catch(err => {
                describeAwtsmoosError(err, {
                    label: "Index [Main]: Failed to manifest the UI Chariot",
                    phase: "dynamic import",
                    moduleURL: new URL(ikarModuleURL, import.meta.url).href
                });
            });
    });
}
