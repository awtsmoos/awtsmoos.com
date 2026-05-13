
/**
 * B"H
 * @file WorkerCreator.js
 * @description
 * Worker creation as a tiny module.
 */

import { oyvedManagerLog } from "../log/MainTextLogger.js";

/**
 * B"H
 * Creates a module worker.
 *
 * @param {string} workerPath
 * Worker URL.
 *
 * @returns {Worker}
 * New worker.
 */
export function createModuleWorker(workerPath) {
  oyvedManagerLog.info("Creating module worker", {
    workerPath
  });

  return new Worker(workerPath, {
    type: "module"
  });
}
