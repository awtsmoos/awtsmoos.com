// B"H
/**
 * @file WorldFinalReadySignal.js
 * @description Joins completed postbuild and renderer-confirmed frame into one final loading milestone.
 */
function ready(olam) { return Boolean(olam && olam.__firstRenderConfirmed && olam.__worldPostbuildReady); }
function childCount(olam) { return olam && olam.scene && Array.isArray(olam.scene.children) ? olam.scene.children.length : 0; }
function post(detail) { if (typeof globalThis !== "undefined" && typeof globalThis.postMessage === "function") globalThis.postMessage(detail); }
export function signalWorldFinalReady(olam, detail = {}) {
  if (!ready(olam)) return false;
  if (olam.__worldFinalReadyPosted) return true;
  olam.__worldFinalReadyPosted = true;
  post({ type:"worker_progress", stage:"world_final_ready", hide:true, sceneChildren:childCount(olam), ...detail });
  return true;
}
export default signalWorldFinalReady;
