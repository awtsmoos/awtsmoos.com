
/**
 * B"H
 * @file WorkerTextLogger.js
 * @description
 * Worker-specific text logger.
 *
 * Every worker log stays readable.
 * Every message is plain text.
 * Every path is visible.
 */

import { TextLogger } from "./TextLogger.js";

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
 * Posts a text-only log to the main thread.
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
  try {
    self.postMessage({
      type,
      text: String(text)
    });
  } catch (error) {
    workerErrorLog.error("Failed to post text message to main thread", {
      reason: error?.message || String(error)
    });
  }
}
