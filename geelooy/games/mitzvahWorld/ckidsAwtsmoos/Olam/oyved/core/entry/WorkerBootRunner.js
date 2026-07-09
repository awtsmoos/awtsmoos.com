
/**
 * B"H
 * @file WorkerBootRunner.js
 * @description
 * Runs Worker vessel boot with visible progress.
 */

import { postPlainWorkerError } from "./PlainWorkerPost.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { setWorkerSystemCore } from "./WorkerBootState.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { runWorkerStage } from "./WorkerProgressTry.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";

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
  postWorkerProgress("boot-runner:start");

  try {
    if (!OlamDynamicBoot || typeof OlamDynamicBoot.invokeAngelicVessels !== "function") {
      throw new Error("OlamDynamicBoot missing static invokeAngelicVessels method");
    }

    const systemCore = await runWorkerStage("invoke-angelic-vessels", async () => {
      return await OlamDynamicBoot.invokeAngelicVessels();
    });

    const ready = await runWorkerStage("set-worker-system-core", async () => {
      return setWorkerSystemCore(state, systemCore);
    });

    postWorkerProgress(`boot-runner:done:ready=${ready}`);
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
