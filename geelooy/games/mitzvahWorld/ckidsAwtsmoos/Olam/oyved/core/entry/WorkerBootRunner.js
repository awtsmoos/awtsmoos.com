
/**
 * B"H
 * @file WorkerBootRunner.js
 * @description
 * Runs Worker vessel boot without re-importing modules twice.
 */

import { postPlainWorkerText, postPlainWorkerError } from "./PlainWorkerPost.js";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js";
import { setWorkerSystemCore } from "./WorkerBootState.js";

/**
 * B"H
 * Starts boot and stores the promise on state.
 *
 * @param {Object} state
 * Worker state.
 *
 * @param {any} OlamDynamicBoot
 * Boot bridge class.
 *
 * @returns {Promise<boolean>}
 * Ready flag.
 */
export function startWorkerBoot(state, OlamDynamicBoot) {
  state.bootPromise = runWorkerBoot(state, OlamDynamicBoot);
  return state.bootPromise;
}

/**
 * B"H
 * Runs boot.
 *
 * @param {Object} state
 * Worker state.
 *
 * @param {any} OlamDynamicBoot
 * Boot bridge class.
 *
 * @returns {Promise<boolean>}
 * Ready flag.
 */
async function runWorkerBoot(state, OlamDynamicBoot) {
  postPlainWorkerText("worker_text_log", "Worker boot runner started");

  try {
    if (!OlamDynamicBoot || typeof OlamDynamicBoot.invokeAngelicVessels !== "function") {
      throw new Error("OlamDynamicBoot missing static invokeAngelicVessels method");
    }

    const systemCore = await OlamDynamicBoot.invokeAngelicVessels();
    const ready = setWorkerSystemCore(state, systemCore);

    postPlainWorkerText("worker_text_log", `Worker boot runner finished || ready=${ready}`);
    return ready;
  } catch (error) {
    const text = [
      "Worker boot runner failed",
      plainWorkerErrorText(error)
    ].join(" || ");

    postPlainWorkerError(text, isPlainImportError(error));
    return false;
  }
}
