// B"H
/**
 * @file WorkerBootImports.js
 * Worker dynamic imports that stay correct inside compact bundles.
 */
import { postPlainWorkerText } from "./PlainWorkerPost.js";
import { plainWorkerErrorText } from "./PlainWorkerErrorText.js";
const SEAL = "compact-worker-absolute-core-20260702-bh1";
const ROOT = "/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/core";
const PATHS = Object.freeze({
  boot: `${ROOT}/boot/OlamDynamicBoot.js?compact=true&v=${SEAL}`,
  interpreter: `${ROOT}/interpreter/OyvedMessageInterpreter.js?compact=true&v=${SEAL}`
});
function report(kind, text) { postPlainWorkerText(kind, text); }
function withCacheBust(url) { return `${url}&awts=${SEAL}`; }
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
      "repoOnlyFix=absolute compact worker core URL must return application/javascript"
    ].join(" || ");
    console.error(`B"H | ${text}`);
    report("worker_import_error_text", text);
    throw error;
  }
}
export function importBootModule() {
  return importWorkerDependency(PATHS.boot, "OlamDynamicBoot");
}
export function importInterpreterModule() {
  return importWorkerDependency(PATHS.interpreter, "OyvedMessageInterpreter");
}
