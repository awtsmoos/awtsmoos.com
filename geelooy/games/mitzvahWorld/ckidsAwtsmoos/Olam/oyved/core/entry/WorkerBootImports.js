// B"H
/**
 * @file WorkerBootImports.js
 * @description Absolute worker boot imports that cannot inherit lowercase Olam.
 */
import { postPlainWorkerText } from "./PlainWorkerPost.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { plainWorkerErrorText } from "./PlainWorkerErrorText.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";

export const WORKER_BOOT_IMPORT_SEAL = "worker-module-olam-index-fix-20260708-bh6";

const ROOT = "/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/core";
const CASE_FIXES = Object.freeze([
  ["/games/mitzvahWorld/ckidsAwtsmoos/olam/", "/games/mitzvahWorld/ckidsAwtsmoos/Olam/"],
  ["/geelooy/games/mitzvahWorld/ckidsAwtsmoos/olam/", "/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/"]
]);

const PATHS = Object.freeze({
  boot: `${ROOT}/boot/OlamDynamicBoot.js?compact=true&v=${WORKER_BOOT_IMPORT_SEAL}`,
  interpreter: `${ROOT}/interpreter/OyvedMessageInterpreter.js?compact=true&v=${WORKER_BOOT_IMPORT_SEAL}`
});

/**
 * B"H
 * Repairs Olam casing without importing any boot dependency first.
 *
 * @param {string} url Absolute or path-like module URL.
 * @returns {string} Canonical uppercase Olam URL.
 */
export function canonicalizeWorkerDependencyUrl(url) {
  let out = String(url || "");
  for (const [bad, good] of CASE_FIXES) out = out.replace(bad, good);
  return out;
}

/**
 * B"H
 * Adds the worker cache seal after canonicalization for stable import keys.
 *
 * @param {string} url Module URL before cache sealing.
 * @returns {string} Canonical import URL.
 */
export function createWorkerDependencyImportUrl(url) {
  const canonical = canonicalizeWorkerDependencyUrl(url);
  const sep = canonical.includes("?") ? "&" : "?";
  return `${canonical}${sep}awts=${WORKER_BOOT_IMPORT_SEAL}`;
}

function report(kind, text) {
  postPlainWorkerText(kind, text);
}

/**
 * B"H
 * Imports one dependency and reports exact repair guidance if it fails.
 *
 * @param {string} path Canonical path or URL.
 * @param {string} label Human diagnostic label.
 * @returns {Promise<object>} Imported module namespace.
 */
export async function importWorkerDependency(path, label) {
  const url = createWorkerDependencyImportUrl(path);
  report("worker_text_log", `Worker importing dependency || label=${label} || path=${url}`);

  try {
    const module = await import(url);
    report("worker_text_log", `Worker imported dependency || label=${label} || path=${url}`);
    return module;
  } catch (error) {
    const text = [
      "Worker dependency import failed",
      `label=${label}`,
      `path=${url}`,
      plainWorkerErrorText(error),
      "friendlyRepair=The worker must load ckidsAwtsmoos/Olam with uppercase Olam. Clear the cached worker and retry; do not create a lowercase olam alias.",
      "repoOnlyFix=absolute compact worker core URL must return application/javascript and preserve uppercase Olam"
    ].join(" || ");
    console.error(`B\"H | ${text}`);
    report("worker_import_error_text", text);
    throw error;
  }
}

/** @returns {Promise<object>} B"H dynamic Olam boot module. */
export function importBootModule() {
  return importWorkerDependency(PATHS.boot, "OlamDynamicBoot");
}

/** @returns {Promise<object>} B"H worker message interpreter module. */
export function importInterpreterModule() {
  return importWorkerDependency(PATHS.interpreter, "OyvedMessageInterpreter");
}
