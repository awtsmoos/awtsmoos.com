// B"H
/** UiEventRoutes.js — direct/fallback UI dispatch split from loading logic. */
import { FALLBACK_ONLY } from "./LoadingUiMath.js?compact=true&v=door-roof-target-20260708-bh1";

export function acknowledge(manager, id) {
  if (id && manager.eved) manager.eved.postMessage({ type:"uiEvented", id });
}

export function createUiEventRoute(manager, DIRECT, directFallback) {
  return function sendUiEvent(data = {}) {
    const { shaym, ob, id } = data || {};
    if (FALLBACK_ONLY.has(shaym)) { directFallback(manager, shaym, ob); acknowledge(manager, id); return; }
    if (DIRECT.has(shaym)) directFallback(manager, shaym, ob);
    else { try { if (shaym && manager.myUi) manager.myUi.peula(shaym, ob, id); } catch {} directFallback(manager, shaym, ob); }
    acknowledge(manager, id);
  };
}
