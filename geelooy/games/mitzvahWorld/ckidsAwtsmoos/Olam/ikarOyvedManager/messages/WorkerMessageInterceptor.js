
/**
 * B"H
 * @file WorkerMessageInterceptor.js
 * @description
 * Main thread Worker message interceptor.
 */

import { oyvedManagerLog } from "../log/MainTextLogger.js";
import { workerMessageToText, isWorkerTextLog } from "./WorkerMessageText.js";
import { makeWorkerErrorAlertText } from "./WorkerErrorAlertText.js";

/**
 * B"H
 * Marks vessel ready on both new runtime and old legacy fields.
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

  if (isWorkerTextLog(data)) {
    oyvedManagerLog.info(workerMessageToText(data));
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
    oyvedManagerLog.info("Worker vessel ready");
    manager._dispatchPawsawch();
    return;
  }

  if (data.type === "loadedWorld") {
    markWorldLoaded(manager);
    oyvedManagerLog.info("Worker loaded world");
    return;
  }

  if (data.type === "canvas_transferred") {
    markCanvasTransferred(manager);
    oyvedManagerLog.info("Canvas transferred to worker");
  }
}
