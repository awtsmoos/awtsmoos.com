// B"H
/** Absolute worker boot imports for the active tested live gate. */
import { postPlainWorkerText } from "./PlainWorkerPost.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { plainWorkerErrorText } from "./PlainWorkerErrorText.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
export const WORKER_BOOT_IMPORT_SEAL = "actual-tested-live-gates-20260709-bh5";
const ROOT = "/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/core";
const CASE_FIXES = Object.freeze([["/games/mitzvahWorld/ckidsAwtsmoos/olam/", "/games/mitzvahWorld/ckidsAwtsmoos/Olam/"], ["/geelooy/games/mitzvahWorld/ckidsAwtsmoos/olam/", "/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/"]]);
const PATHS = Object.freeze({ boot:`${ROOT}/boot/OlamDynamicBoot.js?compact=true&v=${WORKER_BOOT_IMPORT_SEAL}`, interpreter:`${ROOT}/interpreter/OyvedMessageInterpreter.js?compact=true&v=${WORKER_BOOT_IMPORT_SEAL}` });
export function canonicalizeWorkerDependencyUrl(url) { let out = String(url || ""); for (const [bad, good] of CASE_FIXES) out = out.replace(bad, good); return out; }
export function createWorkerDependencyImportUrl(url) { const canonical = canonicalizeWorkerDependencyUrl(url); const sep = canonical.includes("?") ? "&" : "?"; return `${canonical}${sep}awts=${WORKER_BOOT_IMPORT_SEAL}`; }
function report(kind, text) { postPlainWorkerText(kind, text); }
export async function importWorkerDependency(path, label) {
  const url = createWorkerDependencyImportUrl(path);
  report("worker_text_log", `Worker importing dependency || label=${label} || path=${url}`);
  try { const module = await import(url); report("worker_text_log", `Worker imported dependency || label=${label} || path=${url}`); return module; }
  catch (error) { const text = ["Worker dependency import failed", `label=${label}`, `path=${url}`, plainWorkerErrorText(error), "repoOnlyFix=active tested worker boot gate must resolve to uppercase Olam"].join(" || "); console.error(`B\"H | ${text}`); report("worker_import_error_text", text); throw error; }
}
export function importBootModule() { return importWorkerDependency(PATHS.boot, "OlamDynamicBoot"); }
export function importInterpreterModule() { return importWorkerDependency(PATHS.interpreter, "OyvedMessageInterpreter"); }
