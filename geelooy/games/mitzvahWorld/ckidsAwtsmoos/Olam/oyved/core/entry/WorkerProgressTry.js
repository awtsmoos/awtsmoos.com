
/**
 * B"H
 * @file WorkerProgressTry.js
 * @description
 * Progress-aware try/catch wrappers.
 */

import { postWorkerProgress, postWorkerError } from "../protocol/WorkerProtocol.js";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js";

/**
 * B"H
 * Runs an async step with progress and better error text.
 *
 * @param {string} stage
 * Stage name.
 *
 * @param {Function} fn
 * Async function.
 *
 * @returns {Promise<any>}
 * Function result.
 */
export async function runWorkerStage(stage, fn) {
  postWorkerProgress(`${stage}:start`);

  try {
    const result = await fn();
    postWorkerProgress(`${stage}:done`);
    return result;
  } catch (error) {
    const text = [
      `Worker stage failed`,
      `stage=${stage}`,
      plainWorkerErrorText(error)
    ].join(" || ");

    postWorkerError(text, isPlainImportError(error));
    throw error;
  }
}

/**
 * B"H
 * Runs a sync step with progress and better error text.
 *
 * @param {string} stage
 * Stage name.
 *
 * @param {Function} fn
 * Sync function.
 *
 * @returns {any}
 * Function result.
 */
export function runWorkerStageSync(stage, fn) {
  postWorkerProgress(`${stage}:start`);

  try {
    const result = fn();
    postWorkerProgress(`${stage}:done`);
    return result;
  } catch (error) {
    const text = [
      `Worker sync stage failed`,
      `stage=${stage}`,
      plainWorkerErrorText(error)
    ].join(" || ");

    postWorkerError(text, isPlainImportError(error));
    throw error;
  }
}
