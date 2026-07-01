// B"H
/**
 * @file WorkerMessageInterceptor.js
 * @purpose Convert worker protocol messages into authoritative main-thread state.
 * @owner mitzvahWorld worker manager.
 * @inputs Worker message events from the live module worker.
 * @outputs progress records, ready phases, diagnostics, visible loading errors.
 * @runtimeAuthority worker lifecycle stages may open gameplay only through final proof.
 * @updateOrder intercept -> record -> mark lifecycle -> dispatch final event.
 * @callers OlamWorkerManager.eved.onmessage.
 * @invariants world_final_ready implies worldLoaded and canvasTransferred.
 * @failureModes malformed messages are ignored; import errors stay visible.
 */
import { oyvedManagerLog } from "../log/MainTextLogger.js";
import { workerMessageToText, isWorkerTextLog } from "./WorkerMessageText.js";
import { makeWorkerErrorAlertText } from "./WorkerErrorAlertText.js";
import { recordWorkerProgress } from "../progress/WorkerProgressStore.js";
import LoadingProgress from "../../uiManager/logic/LoadingProgressBridge.js?v=real-final-ready-20260701-bh2";
const VISIBLE_PROGRESS = new Set(["entrypoint:start", "boot-runner:start", "angelic-invoker:start", "vessel_ready", "message:pawsawch:received", "message:pawsawch:handleMessage:start", "message:pawsawch:handleMessage:done", "loadedWorld", "canvas_transferred", "world_final_ready"]);
const trimArray = (value, max) => Array.isArray(value) ? value.slice(-max) : [];
const nowStamp = () => new Date().toISOString();
function ensureLivingRegionMain() { window.__AWTSMOOS_LIVING_REGION_MAIN__ ||= { version:"living-region-main-proof-20260617-progress-single-voice", bootedAt:nowStamp(), received:[] }; return window.__AWTSMOOS_LIVING_REGION_MAIN__; }
function requestProbe() { const m = window.__AWTSMOOS_ACTIVE_WORKER_MANAGER__ || window.mana?.socket; m?.postMessage?.({ playerProbe:{ id:`groundDiag-${Date.now()}`, seal:"window-grounding-diag" } }); }
function latestGroundingDiag() { const probe = window.__AWTSMOOS_LAST_PLAYER_PROBE__; if (!probe?.visualClamp) requestProbe(); return probe?.visualClamp || { warnings:["player grounding diagnostic not ready"], requestedWorkerProbe:true }; }
function installWindowCollisionDiagnostics() {
  if (window.__AWTSMOOS_WINDOW_COLLISION_DIAG_INSTALLED__) return;
  window.__AWTSMOOS_WINDOW_COLLISION_DIAG_INSTALLED__ = true;
  window.__MITZVAH_PLAYER_GROUNDING_DIAG__ ||= latestGroundingDiag;
  window.__AWTS_COLLISION_DIAG__ = () => { const stats = window.AWTSMOOS_LIVING_REGION_STATS || window.__AWTSMOOS_LIVING_REGION_MAIN__?.runtimeStats || {}; const probeCollision = window.__AWTSMOOS_LAST_PLAYER_PROBE__?.collisionDiag || null; return stats.collisionAuthority || probeCollision || { terrain:stats.collisionAuthority?.terrain || null, houses:stats.houseCollisionWorld || null, player:stats.collisionAuthority?.player || null, lastGroundHit:stats.collisionAuthority?.lastGroundHit || null, lastHouseCollision:stats.houseCollisionWorld?.lastCollision || null, budget:stats.collisionAuthority?.budget || null, windowBridge:true }; };
  window.__AWTS_BUBBLE_DIAG__ = () => { const collision = window.__AWTS_COLLISION_DIAG__?.() || {}; const probeBubble = window.__AWTSMOOS_LAST_PLAYER_PROBE__?.bubbleDiag || null; return probeBubble ? { ...probeBubble, windowBridge:true, source:"playerProbe" } : { player:collision.player || null, terrainIndex:collision.terrain?.index || null, houseIndex:collision.houses?.index || null, windowBridge:true }; };
  window.__AWTS_GROUNDING_DIAG__ ||= () => ({ collision:window.__AWTS_COLLISION_DIAG__?.()?.terrain || null, windowBridge:true });
}
function dispatchGameReadyPhase(stage, payload = {}) { try { window.dispatchEvent?.(new CustomEvent("awtsmoos-game-ready", { detail:{ phase:stage, source:"worker-progress", payload } })); } catch {} }
function rememberLivingRegion(type, payload) { const main = ensureLivingRegionMain(), entry = { at:nowStamp(), type, payload:payload || null }; main.received = trimArray([...(main.received || []), entry], 24); main.last = entry; if (type === "runtime") { main.runtimeStats = payload?.stats || payload || null; window.AWTSMOOS_LIVING_REGION_STATS = main.runtimeStats; } if (type === "director") { main.directorReport = payload?.report || payload || null; window.AWTSMOOS_LIVING_REGION_REPORT = main.directorReport; } window.AWTSMOOS_LIVING_REGION_MAIN = main; window.AWTSMOOS_REGION_DEBUG = window.AWTSMOOS_REGION_DEBUG || {}; window.AWTSMOOS_REGION_DEBUG.livingRegion = main; recordWorkerProgress(`living-region:${type}`, { type:`living-region:${type}`, payload }); }
function markVesselReady(manager) { if (manager.runtime) manager.runtime.vesselIsReady = true; manager._vesselIsReady = true; }
function markWorldLoaded(manager) { if (manager.runtime) manager.runtime.worldLoaded = true; manager._worldLoaded = true; }
function markCanvasTransferred(manager) { if (manager.runtime) manager.runtime.canvasTransferred = true; manager._canvasTransferred = true; }
function markLifecycle(manager, stage, data) {
  if (stage === "vessel_ready") { markVesselReady(manager); manager._dispatchPawsawch?.(); }
  if (stage === "loadedWorld") markWorldLoaded(manager);
  if (stage === "canvas_transferred") markCanvasTransferred(manager);
  if (stage === "world_final_ready") { markWorldLoaded(manager); markCanvasTransferred(manager); LoadingProgress.markFinalReady?.("worker final ready"); dispatchGameReadyPhase(stage, data); }
}
function shouldAlertImportFailure(data, text) { return Boolean(data.isImportError || text.includes(".js") || text.includes("import") || text.includes("required export") || text.includes("does not provide an export named")); }
function handleProgress(manager, data) { const stage = String(data.stage || data.text || "unknown"); recordWorkerProgress(stage, data); markLifecycle(manager, stage, data); if (VISIBLE_PROGRESS.has(stage) || stage.includes(":")) return; }
function handlePlayerProbeResult(data) { window.__AWTSMOOS_PLAYER_PROBES__ ||= []; window.__AWTSMOOS_LAST_PLAYER_PROBE__ = data.payload || data; window.__AWTSMOOS_PLAYER_PROBES__.push(window.__AWTSMOOS_LAST_PLAYER_PROBE__); window.__AWTSMOOS_PLAYER_PROBES__ = trimArray(window.__AWTSMOOS_PLAYER_PROBES__, 40); console.info('B"H | PLAYER_PROBE_RESULT', window.__AWTSMOOS_LAST_PLAYER_PROBE__); console.info('B"H | PLAYER_PROBE_RESULT_JSON ' + JSON.stringify(window.__AWTSMOOS_LAST_PLAYER_PROBE__)); }
function handleWorkerGameplayFps(data) { const payload = data.payload || data; window.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ = payload; window.AWTSMOOS_GAMEPLAY_FPS = payload; window.dispatchEvent?.(new CustomEvent("awtsmoos:worker-gameplay-fps", { detail:payload })); }
function handleError(data) { const text = workerMessageToText(data); oyvedManagerLog.error(text); LoadingProgress.showError?.(text, "worker protocol error"); if (shouldAlertImportFailure(data, text) && typeof alert === "function") alert(makeWorkerErrorAlertText(text)); }
function handleTextLog(data) { const text = workerMessageToText(data); if (data.type === "worker_import_error_text" || data.type === "ERROR_TEXT") { oyvedManagerLog.error(text); LoadingProgress.showError?.(text, data.type); } }
export function interceptWorkerMessage(manager, event) {
  installWindowCollisionDiagnostics(); const data = event.data;
  if (data?.type === "worker_progress") { handleProgress(manager, data); return; }
  if (data?.type === "worker_gameplay_fps") { handleWorkerGameplayFps(data); return; }
  if (data?.type === "livingRegionRuntimeStats") { rememberLivingRegion("runtime", data.payload || data); return; }
  if (data?.type === "livingRegionDirectorReport") { rememberLivingRegion("director", data.payload || data); return; }
  if (data?.type === "render_trace") { const stage = String(data.stage || "unknown"), payload = JSON.stringify(data.payload || {}); if (window.__AWTSMOOS_RENDER_TRACE__ === true) console.info(`B"H | RENDER_TRACE | ${stage} | ${payload}`); return; }
  if (data?.type === "playerProbeResult") { handlePlayerProbeResult(data); return; }
  if (isWorkerTextLog(data)) { handleTextLog(data); return; }
  if (!data || typeof data !== "object") return;
  if (data.type === "ERROR" || data.type === "ERROR_TEXT") { handleError(data); return; }
  if (data.type === "vessel_ready") { markLifecycle(manager, "vessel_ready", data); recordWorkerProgress("vessel_ready", data); return; }
  if (data.type === "loadedWorld") { markLifecycle(manager, "loadedWorld", data); recordWorkerProgress("loadedWorld", data); return; }
  if (data.type === "canvas_transferred") { markLifecycle(manager, "canvas_transferred", data); recordWorkerProgress("canvas_transferred", data); return; }
  if (data.type === "world_final_ready") { markLifecycle(manager, "world_final_ready", data); recordWorkerProgress("world_final_ready", data); }
}
