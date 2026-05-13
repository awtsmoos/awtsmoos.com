
/**
 * B"H
 * @file ModuleLoadText.js
 * @description
 * Text-only module import messages.
 */

/**
 * B"H
 * Creates import start text.
 *
 * @param {{label:string,url:string,relativePath:string,expectedEnd:string,requiredExport:string}} record
 * Resolved record.
 *
 * @returns {string}
 * Text.
 */
export function makeModuleStartText(record) {
  return [
    `About to import module`,
    `label=${record.label}`,
    `relativePath=${record.relativePath}`,
    `url=${record.url}`,
    `expectedEnd=${record.expectedEnd}`,
    `requiredExport=${record.requiredExport}`
  ].join(" || ");
}

/**
 * B"H
 * Creates success text.
 *
 * @param {{label:string,url:string,requiredExport:string}} record
 * Resolved record.
 *
 * @returns {string}
 * Text.
 */
export function makeModuleSuccessText(record) {
  return [
    `Module loaded`,
    `label=${record.label}`,
    `url=${record.url}`,
    `requiredExport=${record.requiredExport}`
  ].join(" || ");
}

/**
 * B"H
 * Creates direct failure text.
 *
 * @param {Object} input
 * Failure input.
 *
 * @param {string} input.label
 * Label.
 *
 * @param {string} input.url
 * URL.
 *
 * @param {string} input.relativePath
 * Relative path.
 *
 * @param {string} input.expectedEnd
 * Expected URL ending.
 *
 * @param {string} input.requiredExport
 * Required export.
 *
 * @param {unknown} input.error
 * Error.
 *
 * @returns {string}
 * Text-only failure report.
 */
export function makeModuleFailureText(input) {
  const err = input.error;
  const message = err?.message || String(err);
  const stack = String(err?.stack || "no stack").replace(/\s+/g, " ");

  return [
    `Module failed`,
    `label=${input.label}`,
    `relativePath=${input.relativePath}`,
    `url=${input.url}`,
    `expectedEnd=${input.expectedEnd}`,
    `requiredExport=${input.requiredExport}`,
    `browserError=${message}`,
    `repoOnlyFix=create the exact missing file or correct that file export`,
    `serverSideFixNeeded=false`,
    `stack=${stack}`
  ].join(" || ");
}
