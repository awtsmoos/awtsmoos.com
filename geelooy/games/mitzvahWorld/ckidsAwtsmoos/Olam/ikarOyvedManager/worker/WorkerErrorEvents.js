
/**
 * B"H
 * @file WorkerErrorEvents.js
 * @description
 * Worker error event wiring.
 */

import { oyvedManagerLog } from "../log/MainTextLogger.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { makeWorkerScriptErrorText, makeWorkerMessageErrorText } from "./WorkerErrorText.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

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
