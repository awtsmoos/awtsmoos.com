
/**
 * B"H
 * @file ModuleExportValidator.js
 * @description
 * Tiny export validator for dynamically imported modules.
 */

/**
 * B"H
 * Validates that a module has the required export.
 *
 * @param {any} module
 * Imported module namespace.
 *
 * @param {{label:string,url:string,requiredExport:string}} record
 * Resolved module record.
 *
 * @returns {any}
 * The required export value.
 */
export function requireModuleExport(module, record) {
  const exportName = record.requiredExport || "default";

  if (!module || !module[exportName]) {
    const available = module ? Object.keys(module).join(",") : "none";

    throw new Error(
      [
        `Module loaded but required export is missing`,
        `label=${record.label}`,
        `url=${record.url}`,
        `requiredExport=${exportName}`,
        `availableExports=${available || "none"}`
      ].join(" || ")
    );
  }

  return module[exportName];
}

/**
 * B"H
 * Checks whether a value can be used as a class constructor.
 *
 * @param {any} value
 * Value.
 *
 * @returns {boolean}
 * True when it looks constructable enough for new OlamClass().
 */
export function looksLikeClassConstructor(value) {
  if (typeof value !== "function") return false;

  const text = Function.prototype.toString.call(value);
  return text.startsWith("class ") || Boolean(value.prototype);
}
