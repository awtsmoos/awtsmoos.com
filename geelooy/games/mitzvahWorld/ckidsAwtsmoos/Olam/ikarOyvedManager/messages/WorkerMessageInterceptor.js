// B"H
/**
 * @file WorkerMessageInterceptor.js
 * @description Worker truth enters progress stores and on-demand diagnostics.
 */
import { oyvedManagerLog } from "../log/MainTextLogger.js";
import { workerMessageToText, isWorkerTextLog } from "./WorkerMessageText.js";
import { makeWorkerErrorAlertText } from "./WorkerErrorAlertText.js";
import { recordWorkerProgress } from "../progress/WorkerProgressStore.js";
import LoadingProgress from "../../uiManager/logic/LoadingProgressBridge.js?v=visible-canvas-watchdog-20260621-bh2";
const VISIBLE_PROGRESS = new Set(["entrypoint:start", "boot-runner:start", "angelic-invoker:start", "vessel_ready", "message:pawsawch:received", "message:pawsawch:handleMessage:start", "message:pawsawch:handleMessage:done", "loadedWorld", "canvas_transferred", "world_final_ready"]);
function trimArray(value, max) { return Array.isArray(value) ? value.slice(-max) : []; }
function nowStamp() { return new Date().toISOString(); }
function ensureLivingRegionMain() { window.__AWTSMOOS_LIVING_REGION_MAIN__ ||= { version:"living-region-main-proof-20260617-progress-single-voice", bootedAt:nowStamp(), received:[] }; return window.__AWTSMOOS_LIVING_REGION_MAIN__; }
function requestProbe() { const m = window.__AWTSMOOS_ACTIVE_WORKER_MANAGER__ || window.mana?.socket; m?.postMessage?.({ playerProbe:{ id:`groundDiag-${Date.now()}`, seal:"window-grounding-diag" } }); }
function latestGroundingDiag() { const probe = window.__AWTSMOOS_LAST_PLAYER_PROBE__; if (!probe?.visualClamp) requestProbe(); return probe?.visualClamp || { warnings:["player grounding diagnostic not ready"], requestedWorkerProbe:true }; }
function installWindowCollisionDiagnostics() {
  if (window.__AWTSMOOS_WINDOW_COLLISION_DIAG_INSTALLED__) return;
  window.__AWTSMOOS_WINDOW_COLLISION_DIAG_INSTALLED__ = true;
  window.__MITZVAH_PLAYER_GROUNDING_DIAG__ ||= latestGroundingDiag;
  window.__AWTS_COLLISION_DIAG__ = () => {
    const stats = window.AWTSMOOS_LIVING_REGION_STATS || window.__AWTSMOOS_LIVING_REGION_MAIN__?.runtimeStats || {};
    const probeCollision = window.__AWTSMOOS_LAST_PLAYER_PROBE__?.collisionDiag || null;
    return stats.collisionAuthority || probeCollision || { terrain:stats.collisionAuthority?.terrain || null, houses:stats.houseCollisionWorld || null, player:stats.collisionAuthority?.player || null, lastGroundHit:stats.collisionAuthority?.lastGroundHit || null, lastHouseCollision:stats.houseCollisionWorld?.lastCollision || null, budget:stats.collisionAuthority?.budget || null, windowBridge:true };
  };
  window.__AWTS_BUBBLE_DIAG__ = () => {
    const collision = window.__AWTS_COLLISION_DIAG__?.() || {};
    const probeBubble = window.__AWTSMOOS_LAST_PLAYER_PROBE__?.bubbleDiag || null;
    if (probeBubble) return { ...probeBubble, windowBridge:true, source:"playerProbe" };
    return { player:collision.player || null, terrainIndex:collision.terrain?.index || null, houseIndex:collision.houses?.index || null, windowBridge:true };
  };
  window.__AWTS_GROUNDING_DIAG__ ||= () => ({ collision:window.__AWTS_COLLISION_DIAG__?.()?.terrain || null, windowBridge:true });
}
function dispatchGameReadyPhase(stage, payload = {}) { try { window.dispatchEvent?.(new CustomEvent("awtsmoos-game-ready", { detail:{ phase:stage, source:"worker-progress", payload } })); } catch {} }
function rememberLivingRegion(type, payload) { const main = ensureLivingRegionMain(), entry = { at:nowStamp(), type, payload:payload || null }; main.received = trimArray([...(main.received || []), entry], 24); main.last = entry; if (type === "runtime") { main.runtimeStats = payload?.stats || payload || null; window.AWTSMOOS_LIVING_REGION_STATS = main.runtimeStats; } if (type === "director") { main.directorReport = payload?.report || payload || null; window.AWTSMOOS_LIVING_REGION_REPORT = main.directorReport; } window.AWTSMOOS_LIVING_REGION_MAIN = main; window.AWTSMOOS_REGION_DEBUG = window.AWTSMOOS_REGION_DEBUG || {}; window.AWTSMOOS_REGION_DEBUG.livingRegion = main; recordWorkerProgress(`living-region:${type}`, { type:`living-region:${type}`, payload }); }
function markVesselReady(manager) { if (manager.runtime) manager.runtime.vesselIsReady = true; manager._vesselIsReady = true; }
function markWorldLoaded(manager) { if (manager.runtime) manager.runtime.worldLoaded = true; manager._worldLoaded = true; }
function markCanvasTransferred(manager) { if (manager.runtime) manager.runtime.canvasTransferred = true; manager._canvasTransferred = true; }
function shouldAlertImportFailure(data, text) { return Boolean(data.isImportError || text.includes(".js") || text.includes("import") || text.includes("required export") || text.includes("does not provide an export named")); }
function handleProgress(data) { const stage = String(data.stage || data.text || "unknown"); recordWorkerProgress(stage, data); if (stage === "world_final_ready") { LoadingProgress.markFinalReady?.("worker final ready"); dispatchGameReadyPhase(stage, data); } if (VISIBLE_PROGRESS.has(stage) || stage.includes(":")) return; }
function handlePlayerProbeResult(data) { window.__AWTSMOOS_PLAYER_PROBES__ ||= []; window.__AWTSMOOS_LAST_PLAYER_PROBE__ = data.payload || data; window.__AWTSMOOS_PLAYER_PROBES__.push(window.__AWTSMOOS_LAST_PLAYER_PROBE__); window.__AWTSMOOS_PLAYER_PROBES__ = trimArray(window.__AWTSMOOS_PLAYER_PROBES__, 40); console.info('B"H | PLAYER_PROBE_RESULT', window.__AWTSMOOS_LAST_PLAYER_PROBE__); console.info('B"H | PLAYER_PROBE_RESULT_JSON ' + JSON.stringify(window.__AWTSMOOS_LAST_PLAYER_PROBE__)); }
function handleWorkerGameplayFps(data) { const payload = data.payload || data; window.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ = payload; window.AWTSMOOS_GAMEPLAY_FPS = payload; window.dispatchEvent?.(new CustomEvent("awtsmoos:worker-gameplay-fps", { detail:payload })); }
function handleError(data) { const text = workerMessageToText(data); oyvedManagerLog.error(text); if (shouldAlertImportFailure(data, text)) alert(makeWorkerErrorAlertText(text)); }
export function interceptWorkerMessage(manager, event) { installWindowCollisionDiagnostics(); const data = event.data; if (data && data.type === "worker_progress") { handleProgress(data); return; } if (data && data.type === "worker_gameplay_fps") { handleWorkerGameplayFps(data); return; } if (data && data.type === "livingRegionRuntimeStats") { rememberLivingRegion("runtime", data.payload || data); return; } if (data && data.type === "livingRegionDirectorReport") { rememberLivingRegion("director", data.payload || data); return; } if (data && data.type === "render_trace") { const stage = String(data.stage || "unknown"), payload = JSON.stringify(data.payload || {}); if (window.__AWTSMOOS_RENDER_TRACE__ === true) console.info(`B"H | RENDER_TRACE | ${stage} | ${payload}`); return; } if (data && data.type === "playerProbeResult") { handlePlayerProbeResult(data); return; } if (isWorkerTextLog(data)) { const text = workerMessageToText(data); if (data.type === "worker_import_error_text" || data.type === "ERROR_TEXT") oyvedManagerLog.error(text); return; } if (!data || typeof data !== "object") return; if (data.type === "ERROR" || data.type === "ERROR_TEXT") { handleError(data); return; } if (data.type === "vessel_ready") { markVesselReady(manager); recordWorkerProgress("vessel_ready", data); manager._dispatchPawsawch(); return; } if (data.type === "loadedWorld") { markWorldLoaded(manager); recordWorkerProgress("loadedWorld", data); return; } if (data.type === "canvas_transferred") { markCanvasTransferred(manager); recordWorkerProgress("canvas_transferred", data); return; } if (data.type === "world_final_ready") { recordWorkerProgress("world_final_ready", data); LoadingProgress.markFinalReady?.("worker final ready"); dispatchGameReadyPhase("world_final_ready", data); } }
