
/**
 * B"H
 * @file WorkerMessageText.js
 * @description
 * Text-only rendering for worker messages.
 */

/**
 * B"H
 * Gets message text without dumping objects to console.
 *
 * @param {any} data
 * Worker message data.
 *
 * @returns {string}
 * Text.
 */
export function workerMessageToText(data) {
  if (!data) return "Worker message empty";

  if (typeof data === "string") return data;

  if (data.text) return String(data.text);
  if (data.errorText) return String(data.errorText);
  if (data.details) return String(data.details);
  if (data.message) return String(data.message);

  if (data.type) return `Worker message type=${data.type}`;

  return "Worker message with no readable text";
}

/**
 * B"H
 * Returns true if message is worker text log.
 *
 * @param {any} data
 * Data.
 *
 * @returns {boolean}
 * True if text log.
 */
export function isWorkerTextLog(data) {
  return Boolean(data && (
    data.type === "worker_text_log" ||
    data.type === "worker_import_error_text" ||
    data.type === "ERROR_TEXT"
  ));
}
