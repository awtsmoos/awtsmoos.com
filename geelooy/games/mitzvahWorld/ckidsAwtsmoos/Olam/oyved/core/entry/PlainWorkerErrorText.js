
/**
 * B"H
 * @file PlainWorkerErrorText.js
 * @description
 * Turns Worker errors into flat readable text.
 */

/**
 * B"H
 * Converts any thrown value into text.
 *
 * @param {unknown} error
 * Error.
 *
 * @returns {string}
 * Text.
 */
export function plainWorkerErrorText(error) {
  if (error instanceof Error) {
    return [
      `${error.name}: ${error.message}`,
      `stack=${String(error.stack || "no stack").replace(/\s+/g, " ")}`,
      `cause=${error.cause?.message || error.cause || "none"}`
    ].join(" || ");
  }

  return String(error);
}

/**
 * B"H
 * Detects import-like errors.
 *
 * @param {unknown} error
 * Error.
 *
 * @returns {boolean}
 * True if import-like.
 */
export function isPlainImportError(error) {
  const text = plainWorkerErrorText(error);

  return [
    "Failed to fetch dynamically imported module",
    "does not provide an export named",
    "MIME type",
    "application/json",
    "404",
    ".js"
  ].some(part => text.includes(part));
}
