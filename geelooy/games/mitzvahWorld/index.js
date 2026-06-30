// B"H
/** @file index.js @description Thin boot wrapper for Mitzvah World. */
import { traceBoot } from "./uiBridge/bridgeSeal.js";
import { installBootDiagnostics, installBootErrorListeners } from "./uiBridge/bootErrors.js";
import { bootIkarNow } from "./uiBridge/bootIkar.js";

installBootErrorListeners();
installBootDiagnostics();

export async function heescheel(ctx) {
  if (traceBoot()) console.info('B"H - Index [Worker]: data-driven level hook.', Boolean(ctx));
}

export function ready(ctx) {
  ctx.postMsg({ type:"game started", payload:true });
}

export function afterBriyah(ctx) {
  if (traceBoot()) console.info('B"H - Index [Worker]: afterBriyah() called', Boolean(ctx));
}

if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", bootIkarNow, { once:true });
else bootIkarNow();
