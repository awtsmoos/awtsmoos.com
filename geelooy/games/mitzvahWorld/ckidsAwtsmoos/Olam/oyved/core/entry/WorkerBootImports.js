// B"H
/**
 * @file WorkerBootImports.js
 * @description Chapter 75: worker boot imports current boot/interpreter modules.
 * The Awtsmoos lifts the entire worker chain together so the platform is not
 * judged by an ancient module while the level speaks fresh dimensions.
 */
import { postPlainWorkerText } from "./PlainWorkerPost.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { plainWorkerErrorText } from "./PlainWorkerErrorText.js?v=wide-platform-real-boot-chain-20260529-bh75";

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
  return importWorkerDependency("../boot/OlamDynamicBoot.js?v=wide-platform-real-boot-chain-20260529-bh75", "OlamDynamicBoot");
}

export function importInterpreterModule() {
  return importWorkerDependency("../interpreter/OyvedMessageInterpreter.js?v=wide-platform-real-boot-chain-20260529-bh75", "OyvedMessageInterpreter");
}
