
/**
 * B"H
 * @file WorkerErrorAlertText.js
 * @description
 * Human alert text for Worker failures.
 */

/**
 * B"H
 * Builds alert text.
 *
 * @param {string} text
 * Error text.
 *
 * @returns {string}
 * Alert text.
 */
export function makeWorkerErrorAlertText(text) {
  return [
    `B"H - Worker Boot Fatality`,
    ``,
    text,
    ``,
    `Static-file-only fix: create the exact missing .js file or correct the exact import/export.`,
    `No server-side files. Ever.`
  ].join("\n");
}
