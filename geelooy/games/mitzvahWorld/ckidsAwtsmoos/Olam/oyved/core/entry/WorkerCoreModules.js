// B"H
/** Loads the active tested worker boot modules. */
import { importBootModule, importInterpreterModule } from "./WorkerBootImports.js?compact=true&v=actual-tested-live-gates-20260709-bh5";
function requireNamedExport(module, exportName, label) { if (module && module[exportName]) return module[exportName]; const available = module ? Object.keys(module).join(",") : "none"; throw new Error(`${label} loaded but required export is missing || requiredExport=${exportName} || availableExports=${available || "none"}`); }
export async function loadWorkerCoreModules() { const bootModule = await importBootModule(); const interpreterModule = await importInterpreterModule(); return { OlamDynamicBoot:requireNamedExport(bootModule, "OlamDynamicBoot", "OlamDynamicBoot.js"), OyvedMessageInterpreter:requireNamedExport(interpreterModule, "OyvedMessageInterpreter", "OyvedMessageInterpreter.js") }; }
