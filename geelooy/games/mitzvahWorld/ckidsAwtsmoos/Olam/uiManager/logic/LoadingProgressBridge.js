// B"H
/**
 * LoadingProgressBridge.js
 * Public loader API, now split into small vessels so no black screen can hide
 * inside a monolith. The Awtsmoos births each stage; this bridge only reports
 * what has truly arrived and never removes the veil before playable proof.
 */
import { SEAL, FINAL } from "./loading/LoadingConstants.js";
import { clamp, frame } from "./loading/LoadingDom.js";
import { state, hold } from "./loading/LoadingState.js";
import { paint } from "./loading/LoadingPaint.js";
import { record } from "./loading/LoadingLog.js";
import { snapshot } from "./loading/LoadingSnapshot.js";
import { finish, setStopHeartbeat } from "./loading/LoadingFinish.js";
import { startLoadingHeartbeat, stopLoadingHeartbeat } from "./loading/LoadingHeartbeat.js";
import { warmGeneratedAssetCache } from "./loading/LoadingCache.js";

let pending = null;
let paintQueued = false;

export function update(input = {}) {
  if (state.hidden) return;
  pending = { ...(pending || {}), ...input };
  if (paintQueued) return;
  paintQueued = true;
  frame(() => {
    paintQueued = false;
    const next = pending;
    pending = null;
    paint(next || {});
  });
}

export function workerProgress(data = {}) {
  update({ ...data, stage:String(data.stage || data.text || "worker") });
}

export function textureProgress(data = {}) {
  update({ stage:`texture:${data.stage || "progress"}`, texture:clamp(data.percent), ...data });
}

export function showError(error, label = "worker error") {
  update({
    stage:"worker:error",
    total:Math.max(state.total, 58),
    worker:Math.max(state.worker, 50),
    action:"Recovering load...",
    humanLabel:String(label).slice(0, 90),
    log:String(error || label).slice(0, 150),
    softError:true
  });
}

export function markFinalReady(reason = "world_final_ready") {
  const text = String(reason);
  if (FINAL.test(text)) return finish(text);
  hold(text);
  record(`waiting for playable proof: ${text}`);
  return false;
}

export function markPlayable(reason = "first-playable-frame") { return markFinalReady(reason); }
export function hideLoading(reason = "hide requested") { hold(reason); record(`waiting for playable frame: ${reason}`); return false; }
export function scheduleHide() { return hideLoading("scheduleHide"); }
export function isFinalReady() { return Boolean(state.finalReady); }

function installWindowBridge() {
  const queue = Array.isArray(window.__AWTSMOOS_EARLY_LOADING_QUEUE__) ? window.__AWTSMOOS_EARLY_LOADING_QUEUE__.slice(-24) : [];
  window.__AWTSMOOS_LOADING_PROGRESS__ = { update, workerProgress, textureProgress, hideLoading, markFinalReady, markPlayable, scheduleHide, snapshot, isFinalReady, showError, seal:SEAL };
  window.__AWTSMOOS_LOADING_BRIDGE_READY__ = true;
  queue.forEach(update);
  window.addEventListener("awtsmoos-texture-progress", event => textureProgress(event.detail || {}));
  window.addEventListener("awtsmoos-first-playable-frame", event => markFinalReady(event?.detail?.reason || "first-playable-frame"));
  setStopHeartbeat(stopLoadingHeartbeat);
  startLoadingHeartbeat(update);
  warmGeneratedAssetCache();
}

if (typeof window !== "undefined") installWindowBridge();

export default { update, workerProgress, textureProgress, hideLoading, markFinalReady, markPlayable, scheduleHide, startLoadingHeartbeat, stopLoadingHeartbeat, snapshot, isFinalReady, showError };
