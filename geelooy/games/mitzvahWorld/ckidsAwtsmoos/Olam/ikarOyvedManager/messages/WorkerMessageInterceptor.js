// B"H
/**
 * @file WorkerMessageInterceptor.js
 * @description
 * Chapter 432: The main thread receives the worker's sealed village proof.
 *
 * The Awtsmoos lets the world bloom inside the worker, where console logs can
 * become a sea too large for the tunnel. This interceptor therefore keeps the
 * river narrow: worker progress, player probes, and compact living-region proof
 * are stored on tiny globals instead of sprayed into endless browser thunder.
 */
import { oyvedManagerLog } from "../log/MainTextLogger.js";
import { workerMessageToText, isWorkerTextLog } from "./WorkerMessageText.js";
import { makeWorkerErrorAlertText } from "./WorkerErrorAlertText.js";
import { recordWorkerProgress } from "../progress/WorkerProgressStore.js";

const VISIBLE_PROGRESS = new Set([
  "entrypoint:start",
  "boot-runner:start",
  "angelic-invoker:start",
  "vessel_ready",
  "message:pawsawch:received",
  "message:pawsawch:handleMessage:start",
  "message:pawsawch:handleMessage:done",
  "loadedWorld",
  "canvas_transferred"
]);

function trimArray(value, max) {
  return Array.isArray(value) ? value.slice(-max) : [];
}

function nowStamp() {
  return new Date().toISOString();
}

function ensureLivingRegionMain() {
  window.__AWTSMOOS_LIVING_REGION_MAIN__ ||= {
    version: "living-region-main-proof-20260612-bh1",
    bootedAt: nowStamp(),
    received: []
  };
  return window.__AWTSMOOS_LIVING_REGION_MAIN__;
}

function rememberLivingRegion(type, payload) {
  const main = ensureLivingRegionMain();
  const entry = { at: nowStamp(), type, payload: payload || null };
  main.received = trimArray([...(main.received || []), entry], 24);
  main.last = entry;
  if (type === "runtime") {
    main.runtimeStats = payload?.stats || payload || null;
    window.AWTSMOOS_LIVING_REGION_STATS = main.runtimeStats;
  }
  if (type === "director") {
    main.directorReport = payload?.report || payload || null;
    window.AWTSMOOS_LIVING_REGION_REPORT = main.directorReport;
  }
  window.AWTSMOOS_LIVING_REGION_MAIN = main;
  window.AWTSMOOS_REGION_DEBUG = window.AWTSMOOS_REGION_DEBUG || {};
  window.AWTSMOOS_REGION_DEBUG.livingRegion = main;
  recordWorkerProgress(`living-region:${type}`);
}

function markVesselReady(manager) {
  if (manager.runtime) manager.runtime.vesselIsReady = true;
  manager._vesselIsReady = true;
}

function markWorldLoaded(manager) {
  if (manager.runtime) manager.runtime.worldLoaded = true;
  manager._worldLoaded = true;
}

function markCanvasTransferred(manager) {
  if (manager.runtime) manager.runtime.canvasTransferred = true;
  manager._canvasTransferred = true;
}

function shouldAlertImportFailure(data, text) {
  return Boolean(data.isImportError || text.includes(".js") || text.includes("import") || text.includes("required export") || text.includes("does not provide an export named"));
}

function handleProgress(data) {
  const stage = String(data.stage || data.text || "unknown");
  recordWorkerProgress(stage);
  if (VISIBLE_PROGRESS.has(stage) || stage.includes(":")) return;
}

function handlePlayerProbeResult(data) {
  window.__AWTSMOOS_PLAYER_PROBES__ ||= [];
  window.__AWTSMOOS_LAST_PLAYER_PROBE__ = data.payload || data;
  window.__AWTSMOOS_PLAYER_PROBES__.push(window.__AWTSMOOS_LAST_PLAYER_PROBE__);
  window.__AWTSMOOS_PLAYER_PROBES__ = trimArray(window.__AWTSMOOS_PLAYER_PROBES__, 40);
  console.info('B"H | PLAYER_PROBE_RESULT', window.__AWTSMOOS_LAST_PLAYER_PROBE__);
}

export function interceptWorkerMessage(manager, event) {
  const data = event.data;

  if (data && data.type === "worker_progress") { handleProgress(data); return; }
  if (data && data.type === "livingRegionRuntimeStats") { rememberLivingRegion("runtime", data.payload || data); return; }
  if (data && data.type === "livingRegionDirectorReport") { rememberLivingRegion("director", data.payload || data); return; }

  if (data && data.type === "render_trace") {
    const stage = String(data.stage || "unknown");
    const payload = JSON.stringify(data.payload || {});
    if (window.__AWTSMOOS_RENDER_TRACE__ === true) console.info(`B"H | RENDER_TRACE | ${stage} | ${payload}`);
    return;
  }

  if (data && data.type === "playerProbeResult") { handlePlayerProbeResult(data); return; }

  if (isWorkerTextLog(data)) {
    const text = workerMessageToText(data);
    if (data.type === "worker_import_error_text" || data.type === "ERROR_TEXT") oyvedManagerLog.error(text);
    return;
  }

  if (!data || typeof data !== "object") return;

  if (data.type === "ERROR" || data.type === "ERROR_TEXT") {
    const text = workerMessageToText(data);
    oyvedManagerLog.error(text);
    if (shouldAlertImportFailure(data, text)) alert(makeWorkerErrorAlertText(text));
    return;
  }

  if (data.type === "vessel_ready") {
    markVesselReady(manager);
    recordWorkerProgress("vessel_ready");
    if (window.__AWTSMOOS_WORKER_TRACE__ === true) console.info(`B"H | WORKER_PROGRESS | vessel_ready`);
    manager._dispatchPawsawch();
    return;
  }

  if (data.type === "loadedWorld") {
    markWorldLoaded(manager);
    recordWorkerProgress("loadedWorld");
    if (window.__AWTSMOOS_WORKER_TRACE__ === true) console.info(`B"H | WORKER_PROGRESS | loadedWorld`);
    return;
  }

  if (data.type === "canvas_transferred") {
    markCanvasTransferred(manager);
    recordWorkerProgress("canvas_transferred");
    if (window.__AWTSMOOS_WORKER_TRACE__ === true) console.info(`B"H | WORKER_PROGRESS | canvas_transferred | ${JSON.stringify(data.payload || {})}`);
  }
}
