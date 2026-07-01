// B"H
/**
 * @file WorldFinalReadySignal.js
 * @purpose Emit the one true world readiness protocol after render and postbuild.
 * @owner mitzvahWorld worker runtime.
 * @inputs olam render flags plus optional readiness detail.
 * @outputs loadedWorld, canvas_transferred, worker_progress, world_final_ready.
 * @runtimeAuthority This is the worker-side final loading gate.
 * @updateOrder postbuild ready + first render -> protocol milestones.
 * @callers heesHawvoos render loop and VillageWorldPolishPass.
 * @invariants never posts final twice; never posts before both proofs exist.
 * @failureModes missing postMessage becomes a safe no-op false boundary.
 */
function ready(olam) { return Boolean(olam && olam.__firstRenderConfirmed && olam.__worldPostbuildReady); }
function childCount(olam) { return olam?.scene && Array.isArray(olam.scene.children) ? olam.scene.children.length : 0; }
function post(detail) { if (typeof globalThis !== "undefined" && typeof globalThis.postMessage === "function") globalThis.postMessage(detail); }
function payload(olam, detail) { return { at:Date.now(), sceneChildren:childCount(olam), ...detail }; }
export function signalWorldFinalReady(olam, detail = {}) {
  if (!ready(olam)) return false;
  if (olam.__worldFinalReadyPosted) return true;
  olam.__worldFinalReadyPosted = true;
  const proof = payload(olam, detail);
  post({ type:"loadedWorld", stage:"loadedWorld", ...proof });
  post({ type:"canvas_transferred", stage:"canvas_transferred", ...proof });
  post({ type:"worker_progress", stage:"world_final_ready", hide:true, ...proof });
  post({ type:"world_final_ready", stage:"world_final_ready", hide:true, ...proof });
  return true;
}
export default signalWorldFinalReady;
