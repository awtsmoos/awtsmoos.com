
/**
 * B"H
 * @file ErrorTextSerializer.js
 * @description
 * Converts thrown values into flat text.
 */

/**
 * B"H
 * Serializes an error into text.
 *
 * @param {unknown} error
 * Error value.
 *
 * @returns {string}
 * Text error.
 */
export function errorToText(error) {
  if (error instanceof Error) {
    return [
      `${error.name}: ${error.message}`,
      `stack=${error.stack || "no stack"}`,
      `cause=${error.cause?.message || error.cause || "none"}`
    ].join(" || ");
  }

  return String(error);
}

/**
 * B"H
 * Detects import-style failure text.
 *
 * @param {unknown} error
 * Error value.
 *
 * @returns {boolean}
 * True if import-like.
 */
export function isImportFailure(error) {
  const text = errorToText(error);

  return [
    "Failed to fetch dynamically imported module",
    "Expected a JavaScript-or-Wasm module script",
    "MIME type",
    "application/json",
    ".js"
  ].some(piece => text.includes(piece));
}
