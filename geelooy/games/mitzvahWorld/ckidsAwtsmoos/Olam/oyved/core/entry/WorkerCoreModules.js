// B"H
/**
 * @file WorkerCoreModules.js
 * @description Chapter 65: loads the fresh boot import bridge.
 */
import { importBootModule, importInterpreterModule } from "./WorkerBootImports.js?v=lean-l1-20260528-bh65";

/** @param {any} module Module. @param {string} exportName Export name. @param {string} label Label. */
function requireNamedExport(module, exportName, label) {
  if (!module || !module[exportName]) {
    const available = module ? Object.keys(module).join(",") : "none";
    throw new Error([`${label} loaded but required export is missing`, `requiredExport=${exportName}`, `availableExports=${available || "none"}`].join(" || "));
  }
  return module[exportName];
}

/** @returns {Promise<{OlamDynamicBoot:any,OyvedMessageInterpreter:any}>} */
export async function loadWorkerCoreModules() {
  const bootModule = await importBootModule();
  const interpreterModule = await importInterpreterModule();
  return {
    OlamDynamicBoot: requireNamedExport(bootModule, "OlamDynamicBoot", "OlamDynamicBoot.js"),
    OyvedMessageInterpreter: requireNamedExport(interpreterModule, "OyvedMessageInterpreter", "OyvedMessageInterpreter.js")
  };
}
