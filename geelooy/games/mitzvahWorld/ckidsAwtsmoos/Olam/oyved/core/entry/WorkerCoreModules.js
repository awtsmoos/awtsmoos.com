
/**
 * B"H
 * @file WorkerCoreModules.js
 * @description
 * Loads and validates Worker core modules once.
 */

import { importBootModule, importInterpreterModule } from "./WorkerBootImports.js";

/**
 * B"H
 * Requires a named export.
 *
 * @param {any} module
 * Module.
 *
 * @param {string} exportName
 * Export name.
 *
 * @param {string} label
 * Label.
 *
 * @returns {any}
 * Export value.
 */
function requireNamedExport(module, exportName, label) {
  if (!module || !module[exportName]) {
    const available = module ? Object.keys(module).join(",") : "none";

    throw new Error(
      [
        `${label} loaded but required export is missing`,
        `requiredExport=${exportName}`,
        `availableExports=${available || "none"}`
      ].join(" || ")
    );
  }

  return module[exportName];
}

/**
 * B"H
 * Loads Worker modules once.
 *
 * @returns {Promise<{OlamDynamicBoot:any,OyvedMessageInterpreter:any}>}
 * Loaded modules.
 */
export async function loadWorkerCoreModules() {
  const bootModule = await importBootModule();
  const interpreterModule = await importInterpreterModule();

  return {
    OlamDynamicBoot: requireNamedExport(bootModule, "OlamDynamicBoot", "OlamDynamicBoot.js"),
    OyvedMessageInterpreter: requireNamedExport(interpreterModule, "OyvedMessageInterpreter", "OyvedMessageInterpreter.js")
  };
}
