// B"H
/**
 * @file WorkerCoreModules.js
 * @description Loads the two core worker modules through canonical import helpers.
 */
import {
  importBootModule,
  importInterpreterModule
} from "./WorkerBootImports.js?v=case-correct-olam-import-20260706-bh3";

function requireNamedExport(module, exportName, label) {
  if (module && module[exportName]) return module[exportName];
  const available = module ? Object.keys(module).join(",") : "none";
  throw new Error([
    `${label} loaded but required export is missing`,
    `requiredExport=${exportName}`,
    `availableExports=${available || "none"}`
  ].join(" || "));
}

/**
 * B"H
 * Loads the dynamic boot facade and message interpreter for the worker.
 *
 * @returns {Promise<{OlamDynamicBoot:Function,OyvedMessageInterpreter:Function}>}
 */
export async function loadWorkerCoreModules() {
  const bootModule = await importBootModule();
  const interpreterModule = await importInterpreterModule();
  return {
    OlamDynamicBoot: requireNamedExport(bootModule, "OlamDynamicBoot", "OlamDynamicBoot.js"),
    OyvedMessageInterpreter: requireNamedExport(
      interpreterModule,
      "OyvedMessageInterpreter",
      "OyvedMessageInterpreter.js"
    )
  };
}
