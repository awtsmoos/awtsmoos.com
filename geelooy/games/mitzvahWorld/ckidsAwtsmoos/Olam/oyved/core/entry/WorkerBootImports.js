
/**
 * B"H
 * @file WorkerBootImports.js
 * @description
 * Dynamic imports for Worker entrypoint dependencies.
 */

import { postPlainWorkerText } from "./PlainWorkerPost.js";
import { plainWorkerErrorText } from "./PlainWorkerErrorText.js";

/**
 * B"H
 * Imports a Worker dependency with exact text checkpoints.
 *
 * @param {string} path
 * Relative path.
 *
 * @param {string} label
 * Label.
 *
 * @returns {Promise<any>}
 * Imported module.
 */
export async function importWorkerDependency(path, label) {
  postPlainWorkerText("worker_text_log", `Worker importing dependency || label=${label} || path=${path}`);
  console.info(`B"H | Worker importing dependency | label=${label} | path=${path}`);

  try {
    const module = await import(path);
    postPlainWorkerText("worker_text_log", `Worker imported dependency || label=${label} || path=${path}`);
    return module;
  } catch (error) {
    const text = [
      "Worker dependency import failed",
      `label=${label}`,
      `path=${path}`,
      plainWorkerErrorText(error),
      "repoOnlyFix=create that exact static file or fix its imports",
      "serverSideFixNeeded=false"
    ].join(" || ");

    console.error(`B"H | ${text}`);
    postPlainWorkerText("worker_import_error_text", text);
    throw error;
  }
}

/**
 * B"H
 * Imports boot module.
 *
 * @returns {Promise<any>}
 * Boot module.
 */
export function importBootModule() {
  return importWorkerDependency("../boot/OlamDynamicBoot.js", "OlamDynamicBoot");
}

/**
 * B"H
 * Imports interpreter module.
 *
 * @returns {Promise<any>}
 * Interpreter module.
 */
export function importInterpreterModule() {
  return importWorkerDependency("../interpreter/OyvedMessageInterpreter.js", "OyvedMessageInterpreter");
}
