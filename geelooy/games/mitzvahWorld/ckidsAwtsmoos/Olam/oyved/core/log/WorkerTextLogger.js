
/**
 * B"H
 * @file WorkerTextLogger.js
 * @description
 * Worker error logger bridge.
 *
 * Normal logs stay suppressed.
 * Protocol messages must never be suppressed.
 */

import { TextLogger } from "./TextLogger.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * B"H
 * Worker boot logger.
 */
export const workerBootLog = new TextLogger("OYVED_BOOT");

/**
 * B"H
 * Worker import logger.
 */
export const workerImportLog = new TextLogger("OYVED_IMPORT");

/**
 * B"H
 * Worker error logger.
 */
export const workerErrorLog = new TextLogger("OYVED_ERROR");

/**
 * B"H
 * Types that are real engine protocol, not normal logs.
 */
const PROTOCOL_TYPES = new Set([
  "vessel_ready",
  "loadedWorld",
  "canvas_transferred",
  "worker_progress"
]);

/**
 * B"H
 * Types that are error logs.
 */
const ERROR_TYPES = new Set([
  "ERROR",
  "ERROR_TEXT",
  "worker_import_error_text"
]);

/**
 * B"H
 * Posts only errors and protocol messages.
 *
 * @param {string} type
 * Message type.
 *
 * @param {string} text
 * Text payload.
 *
 * @returns {void}
 */
export function postTextToMain(type, text) {
  if (!ERROR_TYPES.has(type) && !PROTOCOL_TYPES.has(type)) {
    return;
  }

  try {
    const payload = {
      type,
      text: String(text),
      message: String(text),
      details: String(text),
      errorText: String(text)
    };

    if (type === "worker_progress") {
      payload.stage = String(text);
      payload.at = Date.now();
    }

    self.postMessage(payload);
  } catch (error) {
    workerErrorLog.error("Failed to post Worker message to main thread", {
      reason: error?.message || String(error),
      attemptedType: type
    });
  }
}
