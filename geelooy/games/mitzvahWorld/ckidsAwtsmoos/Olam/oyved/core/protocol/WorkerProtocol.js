
/**
 * B"H
 * @file WorkerProtocol.js
 * @description
 * Worker protocol messages.
 *
 * These are NOT logs.
 * These are engine lifecycle messages.
 *
 * Even when normal logs are suppressed, these must pass:
 * vessel_ready, worker_progress, loadedWorld, canvas_transferred.
 */

/**
 * B"H
 * Sends a Worker protocol message.
 *
 * @param {string} type
 * Protocol message type.
 *
 * @param {Object} payload
 * Message payload.
 *
 * @returns {void}
 */
export function postWorkerProtocol(type, payload = {}) {
  try {
    self.postMessage({
      type,
      ...payload
    });
  } catch (error) {
    console.error(
      `B"H | WORKER_PROTOCOL_ERROR | failed to post protocol message | type=${type} | reason=${error?.message || String(error)}`
    );
  }
}

/**
 * B"H
 * Sends a progress checkpoint.
 *
 * @param {string} stage
 * Progress stage.
 *
 * @param {Object} fields
 * Extra fields.
 *
 * @returns {void}
 */
export function postWorkerProgress(stage, fields = {}) {
  postWorkerProtocol("worker_progress", {
    stage: String(stage),
    at: Date.now(),
    ...fields
  });
}

/**
 * B"H
 * Sends an error message.
 *
 * @param {string} text
 * Error text.
 *
 * @param {boolean} isImportError
 * Whether the error is import-related.
 *
 * @returns {void}
 */
export function postWorkerError(text, isImportError = false) {
  postWorkerProtocol("ERROR", {
    isImportError,
    message: String(text),
    details: String(text),
    errorText: String(text)
  });
}
