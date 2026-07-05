// B"H
/**
 * LoadingProgressBridge.js
 * Public loader API. It paints monotonic progress, keeps a breathing heartbeat,
 * refuses premature hide requests, and exposes diagnostics for browser proof.
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
const raw = { lastTotal:0, regressions:0, updates:0, firstPlayableAt:null, finalReadyAt:null, lastStage:null, lastInput:null };

function updateRaw(input = {}) {
  const total = clamp(input.total ?? input.amount ?? raw.lastTotal);
  raw.updates += 1;
  raw.lastStage = String(input.stage || input.kind || raw.lastStage || "progress");
  raw.lastInput = { ...input, at:Date.now() };
  if (total < raw.lastTotal) raw.regressions += 1;
  raw.lastTotal = Math.max(raw.lastTotal, total);
}

function diag() {
  const snap = snapshot();
  return {
    ...snap,
    raw: { ...raw },
    displayedProgressMonotonic: true,
    rawProgressRegressions: raw.regressions,
    firstPlayableMs: raw.firstPlayableAt ? raw.firstPlayableAt - state.startedAt : null,
    finalReadyMs: raw.finalReadyAt ? raw.finalReadyAt - state.startedAt : null,
    hidden: state.hidden,
    seal: SEAL
  };
}

function publishDiag() {
  if (typeof window === "undefined") return;
  window.__MITZVAH_LOADING_DIAG__ = diag;
  window.__AWTSMOOS_LAST_LOAD_DIAG__ = diag;
}

export function update(input = {}) {
  if (state.hidden) return;
  updateRaw(input);
  publishDiag();
  pending = { ...(pending || {}), ...input };
  if (paintQueued) return;
  paintQueued = true;
  frame(() => {
    paintQueued = false;
    const next = pending;
    pending = null;
    paint(next || {});
    publishDiag();
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
  if (FINAL.test(text)) {
    raw.finalReadyAt ||= Date.now();
    raw.firstPlayableAt ||= raw.finalReadyAt;
    publishDiag();
    return finish(text);
  }
  hold(text);
  record(`waiting for playable proof: ${text}`);
  publishDiag();
  return false;
}

export function markPlayable(reason = "first-playable-frame") {
  raw.firstPlayableAt ||= Date.now();
  return markFinalReady(reason);
}

export function hideLoading(reason = "hide requested") {
  hold(reason);
  record(`waiting for playable frame: ${reason}`);
  publishDiag();
  return false;
}

export function scheduleHide() { return hideLoading("scheduleHide"); }
export function isFinalReady() { return Boolean(state.finalReady); }

function installWindowBridge() {
  const queue = Array.isArray(window.__AWTSMOOS_EARLY_LOADING_QUEUE__) ? window.__AWTSMOOS_EARLY_LOADING_QUEUE__.slice(-24) : [];
  window.__AWTSMOOS_LOADING_PROGRESS__ = { update, workerProgress, textureProgress, hideLoading, markFinalReady, markPlayable, scheduleHide, snapshot, isFinalReady, showError, seal:SEAL };
  window.__AWTSMOOS_LOADING_BRIDGE_READY__ = true;
  publishDiag();
  queue.forEach(update);
  window.addEventListener("awtsmoos-texture-progress", event => textureProgress(event.detail || {}));
  window.addEventListener("awtsmoos-first-playable-frame", event => markPlayable(event?.detail?.reason || "first-playable-frame"));
  setStopHeartbeat(stopLoadingHeartbeat);
  startLoadingHeartbeat(update);
  warmGeneratedAssetCache();
}

if (typeof window !== "undefined") installWindowBridge();

export default { update, workerProgress, textureProgress, hideLoading, markFinalReady, markPlayable, scheduleHide, startLoadingHeartbeat, stopLoadingHeartbeat, snapshot, isFinalReady, showError };
