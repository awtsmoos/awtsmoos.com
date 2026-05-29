// B"H
/**
 * @file WorkerBootImports.js
 * @description Chapter 88: worker boot imports only exact static filenames.
 * The Awtsmoos repairs the mobile worker fatality by refusing query-string
 * module URLs for the boot and interpreter vessels.
 */
import { postPlainWorkerText } from "./PlainWorkerPost.js";
import { plainWorkerErrorText } from "./PlainWorkerErrorText.js";

/** @param {string} path Module path. @param {string} label Human label. @returns {Promise<any>} */
export async function importWorkerDependency(path, label) {
  postPlainWorkerText("worker_text_log", `Worker importing dependency || label=${label} || path=${path}`);
  try {
    const module = await import(path);
    postPlainWorkerText("worker_text_log", `Worker imported dependency || label=${label} || path=${path}`);
    return module;
  } catch (error) {
    const text = ["Worker dependency import failed", `label=${label}`, `path=${path}`, plainWorkerErrorText(error), "repoOnlyFix=create that exact static file or fix its imports"].join(" || ");
    console.error(`B"H | ${text}`);
    postPlainWorkerText("worker_import_error_text", text);
    throw error;
  }
}

export function importBootModule() {
  return importWorkerDependency("../boot/OlamDynamicBoot.js", "OlamDynamicBoot");
}

export function importInterpreterModule() {
  return importWorkerDependency("../interpreter/OyvedMessageInterpreter.js", "OyvedMessageInterpreter");
}
