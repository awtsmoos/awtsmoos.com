
/**
 * B"H
 * @file WorkerMessageInterceptor.js
 * @description
 * Main thread Worker message interceptor with reduced progress logs.
 */

import { oyvedManagerLog } from "../log/MainTextLogger.js";
import { workerMessageToText, isWorkerTextLog } from "./WorkerMessageText.js";
import { makeWorkerErrorAlertText } from "./WorkerErrorAlertText.js";
import { recordWorkerProgress } from "../progress/WorkerProgressStore.js";

/**
 * B"H
 * Important visible progress stages.
 */
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

/**
 * B"H
 * Marks vessel ready.
 *
 * @param {Object} manager
 * Manager.
 *
 * @returns {void}
 */
function markVesselReady(manager) {
  if (manager.runtime) manager.runtime.vesselIsReady = true;
  manager._vesselIsReady = true;
}

/**
 * B"H
 * Marks world loaded.
 *
 * @param {Object} manager
 * Manager.
 *
 * @returns {void}
 */
function markWorldLoaded(manager) {
  if (manager.runtime) manager.runtime.worldLoaded = true;
  manager._worldLoaded = true;
}

/**
 * B"H
 * Marks canvas transferred.
 *
 * @param {Object} manager
 * Manager.
 *
 * @returns {void}
 */
function markCanvasTransferred(manager) {
  if (manager.runtime) manager.runtime.canvasTransferred = true;
  manager._canvasTransferred = true;
}

/**
 * B"H
 * Determines whether an error text deserves alerting.
 *
 * @param {any} data
 * Worker data.
 *
 * @param {string} text
 * Message text.
 *
 * @returns {boolean}
 * True if alert should show.
 */
function shouldAlertImportFailure(data, text) {
  return Boolean(
    data.isImportError ||
    text.includes(".js") ||
    text.includes("import") ||
    text.includes("required export") ||
    text.includes("does not provide an export named")
  );
}

/**
 * B"H
 * Handles progress.
 *
 * @param {any} data
 * Worker data.
 *
 * @returns {void}
 */
function handleProgress(data) {
  const stage = String(data.stage || data.text || "unknown");
  recordWorkerProgress(stage);

  if (VISIBLE_PROGRESS.has(stage) || stage.includes(":")) {
   // console.info(`B"H | WORKER_PROGRESS | ${stage}`);
  }
}

/**
 * B"H
 * Intercepts Worker messages.
 *
 * @param {Object} manager
 * Worker manager instance.
 *
 * @param {MessageEvent} event
 * Worker event.
 *
 * @returns {void}
 */
export function interceptWorkerMessage(manager, event) {
  const data = event.data;

  if (data && data.type === "worker_progress") {
    handleProgress(data);
    return;
  }

  if (data && data.type === "render_trace") {
    const stage = String(data.stage || "unknown");
    const payload = JSON.stringify(data.payload || {});
    console.info(`B"H | RENDER_TRACE | ${stage} | ${payload}`);
    return;
  }

  if (isWorkerTextLog(data)) {
    const text = workerMessageToText(data);

    if (data.type === "worker_import_error_text" || data.type === "ERROR_TEXT") {
      oyvedManagerLog.error(text);
    }

    return;
  }

  if (!data || typeof data !== "object") return;

  if (data.type === "ERROR" || data.type === "ERROR_TEXT") {
    const text = workerMessageToText(data);
    oyvedManagerLog.error(text);

    if (shouldAlertImportFailure(data, text)) {
      alert(makeWorkerErrorAlertText(text));
    }

    return;
  }

  if (data.type === "vessel_ready") {
    markVesselReady(manager);
    recordWorkerProgress("vessel_ready");
    console.info(`B"H | WORKER_PROGRESS | vessel_ready`);
    manager._dispatchPawsawch();
    return;
  }

  if (data.type === "loadedWorld") {
    markWorldLoaded(manager);
    recordWorkerProgress("loadedWorld");
    console.info(`B"H | WORKER_PROGRESS | loadedWorld`);
    return;
  }

  if (data.type === "canvas_transferred") {
    markCanvasTransferred(manager);
    recordWorkerProgress("canvas_transferred");
    console.info(`B"H | WORKER_PROGRESS | canvas_transferred | ${JSON.stringify(data.payload || {})}`);
  }
}
