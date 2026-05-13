
/**
 * B"H
 * @file WorkerErrorEvents.js
 * @description
 * Worker error event wiring.
 */

import { oyvedManagerLog } from "../log/MainTextLogger.js";
import { makeWorkerScriptErrorText, makeWorkerMessageErrorText } from "./WorkerErrorText.js";

/**
 * B"H
 * Adds text-only Worker error events.
 *
 * @param {Worker} worker
 * Worker.
 *
 * @param {string} workerPath
 * Worker path.
 *
 * @returns {void}
 */
export function attachWorkerErrorEvents(worker, workerPath) {
  worker.addEventListener("error", event => {
    oyvedManagerLog.error(makeWorkerScriptErrorText(event, workerPath));
  });

  worker.addEventListener("messageerror", () => {
    oyvedManagerLog.error(makeWorkerMessageErrorText(workerPath));
  });
}
