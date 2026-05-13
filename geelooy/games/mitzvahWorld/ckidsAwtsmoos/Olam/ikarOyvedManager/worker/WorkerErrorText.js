
/**
 * B"H
 * @file WorkerErrorText.js
 * @description
 * Builds plain text for main thread Worker error events.
 */

/**
 * B"H
 * Creates text for Worker script error event.
 *
 * @param {ErrorEvent} event
 * Error event.
 *
 * @param {string} workerPath
 * Worker path.
 *
 * @returns {string}
 * Text.
 */
export function makeWorkerScriptErrorText(event, workerPath) {
  return [
    "Worker script error event fired",
    `workerPath=${workerPath}`,
    `message=${event.message || "unknown"}`,
    `filename=${event.filename || "unknown"}`,
    `line=${event.lineno || 0}`,
    `column=${event.colno || 0}`,
    "Meaning=the Worker top-level script or one of its static imports failed before normal message flow",
    "Fix=use the OYVED_SHELL and WorkerEntrypoint text logs immediately before this line to find the exact child import"
  ].join(" || ");
}

/**
 * B"H
 * Creates text for Worker messageerror event.
 *
 * @param {string} workerPath
 * Worker path.
 *
 * @returns {string}
 * Text.
 */
export function makeWorkerMessageErrorText(workerPath) {
  return [
    "Worker message serialization error",
    `workerPath=${workerPath}`,
    "Meaning=postMessage received data that could not be cloned"
  ].join(" || ");
}
