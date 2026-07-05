// B"H
/**
 * LoadingProgressBridge.js
 * The visual loader is a covenant: raw subsystems may reset, but the child never
 * sees the circle fall back to 0. Raw truth is recorded; displayed light only rises.
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
let pending = null, paintQueued = false;
const raw = { lastTotal:0, regressions:0, updates:0, firstPlayableAt:null, finalReadyAt:null, lastStage:null, lastInput:null };
function rawNumber(input = {}) { return clamp(input.total ?? input.amount ?? input.percent ?? raw.lastTotal); }
function displayFloor(value) {
  const next = clamp(value);
  const floor = state.visualFloor > 0 && next === 0 ? state.visualFloor : Math.max(state.visualFloor || 0, state.total || 0, next);
  state.visualFloor = Math.max(state.visualFloor || 0, floor);
  if (state.visualFloor > 0) state.minDisplayedAfterStart ??= state.visualFloor;
  return state.visualFloor;
}
function updateRaw(input = {}) {
  const total = rawNumber(input), stage = String(input.stage || input.kind || raw.lastStage || "progress");
  raw.updates += 1; raw.lastStage = stage; raw.lastInput = { ...input, at:Date.now() };
  if (total < raw.lastTotal) raw.regressions += 1;
  raw.lastTotal = Math.max(raw.lastTotal, total); state.rawTotal = total;
  state.blockingStages[stage] = (state.blockingStages[stage] || 0) + 1;
  state.slowestBlockingStage = Object.entries(state.blockingStages).sort((a, b) => b[1] - a[1])[0]?.[0] || stage;
}
function displayInput(input = {}) { const out = { ...input }, floor = displayFloor(rawNumber(input)); if (out.total != null || out.amount != null || out.percent != null || out.stage) out.total = Math.min(98, floor); return out; }
function loadingProofFields() { const firstPlayableMs = raw.firstPlayableAt ? raw.firstPlayableAt - state.startedAt : null; return { ok:true, visualNeverResetToZero:state.displayRegressionCount === 0, displayRegressionCount:state.displayRegressionCount, rawRegressionCount:raw.regressions, minDisplayedAfterStart:state.minDisplayedAfterStart ? ">0" : null, sessionResetCount:state.sessionResetCount, firstPlayableMs, loaderAnimationFramesDuringStall:state.loaderAnimationFramesDuringStall, slowestBlockingStage:state.slowestBlockingStage }; }
function diag() { return { ...snapshot(), raw:{ ...raw }, loading:loadingProofFields(), displayedProgressMonotonic:state.displayRegressionCount === 0, rawProgressRegressions:raw.regressions, firstPlayableMs:loadingProofFields().firstPlayableMs, finalReadyMs:raw.finalReadyAt ? raw.finalReadyAt - state.startedAt : null, hidden:state.hidden, seal:SEAL }; }
function publishDiag() { if (typeof window !== "undefined") { window.__MITZVAH_LOADING_DIAG__ = diag; window.__AWTSMOOS_LAST_LOAD_DIAG__ = diag; } }
export function update(input = {}) { if (state.hidden) return; updateRaw(input); publishDiag(); pending = { ...(pending || {}), ...displayInput(input) }; if (paintQueued) return; paintQueued = true; frame(() => { paintQueued = false; const next = pending; pending = null; paint(next || {}); publishDiag(); }); }
export function workerProgress(data = {}) { update({ ...data, stage:String(data.stage || data.text || "worker") }); }
export function textureProgress(data = {}) { update({ stage:`texture:${data.stage || "progress"}`, texture:clamp(data.percent), ...data }); }
export function showError(error, label = "worker error") { update({ stage:"worker:error", total:Math.max(state.total, 58), worker:Math.max(state.worker, 50), action:"Recovering load...", humanLabel:String(label).slice(0, 90), log:String(error || label).slice(0, 150), softError:true }); }
export function markFinalReady(reason = "world_final_ready") { const text = String(reason); if (FINAL.test(text)) { raw.finalReadyAt ||= Date.now(); raw.firstPlayableAt ||= raw.finalReadyAt; publishDiag(); return finish(text); } hold(text); record(`waiting for playable proof: ${text}`); publishDiag(); return false; }
export function markPlayable(reason = "first-playable-frame") { raw.firstPlayableAt ||= Date.now(); return markFinalReady(reason); }
export function hideLoading(reason = "hide requested") { hold(reason); record(`waiting for playable frame: ${reason}`); publishDiag(); return false; }
export function scheduleHide() { return hideLoading("scheduleHide"); }
export function isFinalReady() { return Boolean(state.finalReady); }
export function simulateRawResetForProof() { update({ stage:"proof:raw-24", total:24 }); update({ stage:"proof:raw-reset", total:0 }); return loadingProofFields(); }
function installWindowBridge() { const queue = Array.isArray(window.__AWTSMOOS_EARLY_LOADING_QUEUE__) ? window.__AWTSMOOS_EARLY_LOADING_QUEUE__.slice(-24) : []; window.__AWTSMOOS_LOADING_PROGRESS__ = { update, workerProgress, textureProgress, hideLoading, markFinalReady, markPlayable, scheduleHide, snapshot, isFinalReady, showError, simulateRawResetForProof, seal:SEAL }; window.__AWTSMOOS_LOADING_BRIDGE_READY__ = true; publishDiag(); queue.forEach(update); window.addEventListener("awtsmoos-texture-progress", event => textureProgress(event.detail || {})); window.addEventListener("awtsmoos-first-playable-frame", event => markPlayable(event?.detail?.reason || "first-playable-frame")); setStopHeartbeat(stopLoadingHeartbeat); startLoadingHeartbeat(update); warmGeneratedAssetCache(); }
if (typeof window !== "undefined") installWindowBridge();
export default { update, workerProgress, textureProgress, hideLoading, markFinalReady, markPlayable, scheduleHide, startLoadingHeartbeat, stopLoadingHeartbeat, snapshot, isFinalReady, showError, simulateRawResetForProof };
