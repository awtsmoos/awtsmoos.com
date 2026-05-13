
/**
 * B"H
 * @file WorkerMessageGuard.js
 * @description
 * Message safety helpers.
 */

/**
 * B"H
 * Checks whether incoming data is usable.
 *
 * @param {any} data
 * Incoming data.
 *
 * @returns {boolean}
 * True if object-like.
 */
export function isWorkerMessageObject(data) {
  return Boolean(data && typeof data === "object");
}

/**
 * B"H
 * Converts incoming message type to text.
 *
 * @param {any} data
 * Data.
 *
 * @returns {string}
 * Type text.
 */
export function getWorkerMessageTypeText(data) {
  if (!isWorkerMessageObject(data)) return "non-object";
  return String(data.type || Object.keys(data).join(",") || "object-without-keys");
}
