
/**
 * B"H
 * @file PlainWorkerPost.js
 * @description
 * Plain text postMessage helpers for the Worker realm.
 */

/**
 * B"H
 * Posts text to the main thread.
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
  self.postMessage({
    type,
    text: String(text),
    message: String(text),
    details: String(text),
    errorText: String(text)
  });
}

/**
 * B"H
 * Posts normal worker error text.
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
  self.postMessage({
    type: "ERROR",
    isImportError,
    message: String(text),
    details: String(text),
    errorText: String(text)
  });
}
