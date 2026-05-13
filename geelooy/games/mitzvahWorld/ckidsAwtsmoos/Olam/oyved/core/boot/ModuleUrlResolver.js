
/**
 * B"H
 * @file ModuleUrlResolver.js
 * @description
 * Resolves Worker-relative module paths into exact absolute URLs.
 */

/**
 * B"H
 * Resolves a module URL from this file's import.meta.url context.
 *
 * @param {string} relativePath
 * Relative module path.
 *
 * @returns {string}
 * Absolute URL string.
 */
export function resolveModuleUrl(relativePath) {
  return new URL(relativePath, import.meta.url).href;
}

/**
 * B"H
 * Resolves a full module record.
 *
 * @param {{key:string,label:string,relativePath:string,expectedEnd:string,requiredExport?:string}} record
 * Module path record.
 *
 * @returns {{key:string,label:string,relativePath:string,expectedEnd:string,requiredExport:string,url:string}}
 * Resolved module path record.
 */
export function resolveModuleRecord(record) {
  return {
    key: record.key,
    label: record.label,
    relativePath: record.relativePath,
    expectedEnd: record.expectedEnd,
    requiredExport: record.requiredExport || "default",
    url: resolveModuleUrl(record.relativePath)
  };
}
