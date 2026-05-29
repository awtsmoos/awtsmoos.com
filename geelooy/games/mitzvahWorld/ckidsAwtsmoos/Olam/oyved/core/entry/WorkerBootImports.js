// B"H
/** @file WorkerBootImports.js @description Chapter 50 worker boot imports. */
import { postPlainWorkerText } from "./PlainWorkerPost.js";
import { plainWorkerErrorText } from "./PlainWorkerErrorText.js";

export async function importWorkerDependency(path, label) {
  postPlainWorkerText("worker_text_log", `Worker importing dependency || label=${label} || path=${path}`);
  try { const module = await import(path); postPlainWorkerText("worker_text_log", `Worker imported dependency || label=${label} || path=${path}`); return module; }
  catch (error) { const text = ["Worker dependency import failed", `label=${label}`, `path=${path}`, plainWorkerErrorText(error), "repoOnlyFix=create that exact static file or fix its imports"].join(" || "); console.error(`B"H | ${text}`); postPlainWorkerText("worker_import_error_text", text); throw error; }
}
export function importBootModule() { return importWorkerDependency("../boot/OlamDynamicBoot.js?v=lean-l1-20260528-bh50", "OlamDynamicBoot"); }
export function importInterpreterModule() { return importWorkerDependency("../interpreter/OyvedMessageInterpreter.js?v=lean-l1-20260528-bh50", "OyvedMessageInterpreter"); }
