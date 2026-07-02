// B"H
/** Final reveal: the only blade allowed to cut away the veil. */
import { IDS, SEAL } from "./LoadingConstants.js";
import { removeLoaderDom } from "./LoadingDom.js";
import { state } from "./LoadingState.js";
import { snapshot } from "./LoadingSnapshot.js";
import { completeBars } from "./LoadingBars.js";
import { text } from "./LoadingText.js";
let stopHeartbeat = () => {};
export function setStopHeartbeat(fn) { stopHeartbeat = typeof fn === "function" ? fn : stopHeartbeat; }
export function finish(reason = "world_final_ready") {
  if (state.hidden) return true;
  state.finalReady = true;
  completeBars();
  text(IDS.percent, "100%");
  text(IDS.action, "World ready");
  text(IDS.sub, "Entering now.");
  window.__AWTSMOOS_BOOT_LOADED__ = true;
  window.__AWTSMOOS_LOADING_FINAL_READY__ = snapshot();
  window.dispatchEvent?.(new CustomEvent("awtsmoos-game-ready", {
    detail:{ phase:"world_final_ready", reason, seal:SEAL, payload:snapshot() }
  }));
  setTimeout(() => { state.hidden = true; stopHeartbeat(); removeLoaderDom(); }, 80);
  return true;
}
