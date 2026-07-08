
/**
 * B"H
 * @file PlainWorkerPost.js
 * @description
 * Plain Worker post helpers.
 *
 * Normal logs are suppressed.
 * Protocol messages are allowed.
 */

import { postWorkerProtocol, postWorkerProgress, postWorkerError } from "../protocol/WorkerProtocol.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * B"H
 * Allowed protocol message types.
 */
const PROTOCOL_TYPES = new Set([
  "vessel_ready",
  "loadedWorld",
  "canvas_transferred",
  "worker_progress"
]);

/**
 * B"H
 * Allowed error message types.
 */
const ERROR_TYPES = new Set([
  "ERROR",
  "ERROR_TEXT",
  "worker_import_error_text"
]);

/**
 * B"H
 * Posts text only if it is an error or protocol checkpoint.
 *
 * @param {string} type
 * Message type.
 *
 * @param {string} text
 * Text.
 *
 * @returns {void}
 */
export function postPlainWorkerText(type, text) {
  if (type === "worker_progress") {
    postWorkerProgress(text);
    return;
  }

  if (PROTOCOL_TYPES.has(type)) {
    postWorkerProtocol(type, {
      text: String(text),
      message: String(text),
      details: String(text)
    });
    return;
  }

  if (!ERROR_TYPES.has(type)) {
    return;
  }

  postWorkerProtocol(type, {
    text: String(text),
    message: String(text),
    details: String(text),
    errorText: String(text)
  });
}

/**
 * B"H
 * Posts Worker error text.
 *
 * @param {string} text
 * Error text.
 *
 * @param {boolean} isImportError
 * Whether this is import related.
 *
 * @returns {void}
 */
export function postPlainWorkerError(text, isImportError = false) {
  postWorkerError(text, isImportError);
}
