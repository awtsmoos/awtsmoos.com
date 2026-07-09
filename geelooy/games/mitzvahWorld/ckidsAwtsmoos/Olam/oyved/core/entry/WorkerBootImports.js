// B"H
/** Absolute worker boot imports. No cache query is used as a correctness mechanism. */
import { postPlainWorkerText } from "./PlainWorkerPost.js";
import { plainWorkerErrorText } from "./PlainWorkerErrorText.js";
export const WORKER_BOOT_IMPORT_SEAL = "stable-direct-worker-boot-20260709-bh2";
const ROOT = "/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/core";
const PATHS = Object.freeze({
  boot: `${ROOT}/boot/OlamDynamicBoot.js`,
  interpreter: `${ROOT}/interpreter/OyvedMessageInterpreter.js`
});
function report(kind, text) { postPlainWorkerText(kind, text); }
export async function importWorkerDependency(path, label) {
  report("worker_text_log", `Worker importing dependency || label=${label} || path=${path}`);
  try {
    const module = await import(path);
    report("worker_text_log", `Worker imported dependency || label=${label} || path=${path}`);
    return module;
  } catch (error) {
    const text = ["Worker dependency import failed", `label=${label}`, `path=${path}`, plainWorkerErrorText(error), "repoOnlyFix=real module path/export must exist"].join(" || ");
    console.error(`B"H | ${text}`);
    report("worker_import_error_text", text);
    throw error;
  }
}
export function importBootModule() { return importWorkerDependency(PATHS.boot, "OlamDynamicBoot"); }
export function importInterpreterModule() { return importWorkerDependency(PATHS.interpreter, "OyvedMessageInterpreter"); }
