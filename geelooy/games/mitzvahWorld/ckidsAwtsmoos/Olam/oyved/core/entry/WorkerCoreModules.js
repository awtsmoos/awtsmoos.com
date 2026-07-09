// B"H
/** Loads the worker core modules through real paths. */
import { importBootModule, importInterpreterModule } from "./WorkerBootImports.js";
function requireNamedExport(module, exportName, label) {
  if (module && module[exportName]) return module[exportName];
  const available = module ? Object.keys(module).join(",") : "none";
  throw new Error(`${label} missing export || requiredExport=${exportName} || availableExports=${available || "none"}`);
}
export async function loadWorkerCoreModules() {
  const bootModule = await importBootModule();
  const interpreterModule = await importInterpreterModule();
  return {
    OlamDynamicBoot: requireNamedExport(bootModule, "OlamDynamicBoot", "OlamDynamicBoot.js"),
    OyvedMessageInterpreter: requireNamedExport(interpreterModule, "OyvedMessageInterpreter", "OyvedMessageInterpreter.js")
  };
}
