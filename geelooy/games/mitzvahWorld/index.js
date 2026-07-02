// B"H
/** @file index.js @description Thin boot wrapper for Mitzvah World.
 * The first loading breath names world-engine:import:start here too, so the
 * audit and the phone both know the engine has begun its descent.
 */
import { traceBoot } from "./uiBridge/bridgeSeal.js?v=no-compact-engine-20260702-bh2";
import { installBootDiagnostics, installBootErrorListeners } from "./uiBridge/bootErrors.js?v=no-compact-engine-20260702-bh2";
import { bootIkarNow } from "./uiBridge/bootIkar.js?v=no-compact-engine-20260702-bh2";

const IMPORT_START_STAGE = "world-engine:import:start";

function announceEarlyImportStart() {
  if (typeof window === "undefined") return;
  const payload = {
    stage: IMPORT_START_STAGE,
    total: 30,
    world: 30,
    action: "Preparing Mitzvah World...",
    subAction: "world engine import is being summoned",
    log: "Starting smooth first playable frame"
  };
  window.__AWTSMOOS_LOADING_PROGRESS__?.update?.(payload);
  const q = window.__AWTSMOOS_EARLY_LOADING_QUEUE__;
  if (Array.isArray(q)) q.push(payload);
}

installBootErrorListeners();
installBootDiagnostics();
announceEarlyImportStart();

export async function heescheel(ctx) {
  if (traceBoot()) console.info('B"H - Index [Worker]: data-driven level hook.', Boolean(ctx));
}

export function ready(ctx) {
  ctx.postMsg({ type: "game started", payload: true });
}

export function afterBriyah(ctx) {
  if (traceBoot()) console.info('B"H - Index [Worker]: afterBriyah() called', Boolean(ctx));
}

if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", bootIkarNow, { once: true });
else bootIkarNow();
