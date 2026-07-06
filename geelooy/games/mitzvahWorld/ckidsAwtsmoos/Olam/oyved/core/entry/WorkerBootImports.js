// B"H
/**
 * @file WorkerBootImports.js
 * Worker dynamic imports that stay uppercase-safe inside compact bundles.
 * The phone failure showed a lowercase /ckidsAwtsmoos/olam/ import path; every
 * dependency URL is now canonicalized before import and cache-busted with this
 * fresh seal.
 */
import { postPlainWorkerText } from "./PlainWorkerPost.js";
import { plainWorkerErrorText } from "./PlainWorkerErrorText.js";

export const WORKER_BOOT_IMPORT_SEAL = "case-correct-olam-import-20260706-bh2";
const ROOT = "/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/core";
const PATHS = Object.freeze({
  boot: `${ROOT}/boot/OlamDynamicBoot.js?compact=true&v=${WORKER_BOOT_IMPORT_SEAL}`,
  interpreter: `${ROOT}/interpreter/OyvedMessageInterpreter.js?compact=true&v=${WORKER_BOOT_IMPORT_SEAL}`
});

export function canonicalizeWorkerDependencyUrl(url) {
  return String(url || "")
    .replace("/games/mitzvahWorld/ckidsAwtsmoos/olam/", "/games/mitzvahWorld/ckidsAwtsmoos/Olam/")
    .replace("/geelooy/games/mitzvahWorld/ckidsAwtsmoos/olam/", "/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/");
}

function report(kind, text) { postPlainWorkerText(kind, text); }
function withCacheBust(url) {
  const canonical = canonicalizeWorkerDependencyUrl(url);
  const sep = canonical.includes("?") ? "&" : "?";
  return `${canonical}${sep}awts=${WORKER_BOOT_IMPORT_SEAL}`;
}

export async function importWorkerDependency(path, label) {
  const url = withCacheBust(path);
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
      "repoOnlyFix=absolute compact worker core URL must return application/javascript and preserve uppercase Olam"
    ].join(" || ");
    console.error(`B\"H | ${text}`);
    report("worker_import_error_text", text);
    throw error;
  }
}

export function importBootModule() { return importWorkerDependency(PATHS.boot, "OlamDynamicBoot"); }
export function importInterpreterModule() { return importWorkerDependency(PATHS.interpreter, "OyvedMessageInterpreter"); }
