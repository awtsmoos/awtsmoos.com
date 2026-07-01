// B"H
/** @file WorkerCoreModules.js @description Core worker modules load through bh9 import vessels. */
import { importBootModule, importInterpreterModule } from "./WorkerBootImports.js?v=no-alert-perf-jump-20260701-bh9";
function requireNamedExport(module, exportName, label) { if (!module || !module[exportName]) { const available = module ? Object.keys(module).join(",") : "none"; throw new Error([`${label} loaded but required export is missing`, `requiredExport=${exportName}`, `availableExports=${available || "none"}`].join(" || ")); } return module[exportName]; }
export async function loadWorkerCoreModules() { const bootModule = await importBootModule(); const interpreterModule = await importInterpreterModule(); return { OlamDynamicBoot: requireNamedExport(bootModule, "OlamDynamicBoot", "OlamDynamicBoot.js"), OyvedMessageInterpreter: requireNamedExport(interpreterModule, "OyvedMessageInterpreter", "OyvedMessageInterpreter.js") }; }
