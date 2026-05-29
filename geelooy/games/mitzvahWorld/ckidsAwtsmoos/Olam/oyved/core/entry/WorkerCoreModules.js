// B"H
/**
 * @file WorkerCoreModules.js
 * @description Chapter 75: loads the fresh boot import bridge. The Awtsmoos
 * makes one current chain so worker-created Olam reads MovingPlatform as the
 * authored wide bridge, not as an old cached cube.
 */
import { importBootModule, importInterpreterModule } from "./WorkerBootImports.js?v=wide-platform-real-boot-chain-20260529-bh75";

/** @param {any} module Module. @param {string} exportName Export name. @param {string} label Label. @returns {any} */
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
