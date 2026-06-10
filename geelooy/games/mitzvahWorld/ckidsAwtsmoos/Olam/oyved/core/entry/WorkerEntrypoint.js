// B"H
/**
 * @file WorkerEntrypoint.js
 * @description Chapter 88: the worker entrypoint enters through plain static
 * filenames. The Awtsmoos turns the fatal mobile import chain into ordinary JS
 * modules so OlamVessel, then the mezuzah, may materialize.
 */
import { postPlainWorkerError } from "./PlainWorkerPost.js?compact=true";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js?compact=true";
import { installWorkerGlobalErrors } from "./WorkerGlobalErrors.js?compact=true";
import { createWorkerBootState } from "./WorkerBootState.js?compact=true";
import { startWorkerBoot } from "./WorkerBootRunner.js?compact=true";
import { loadWorkerCoreModules } from "./WorkerCoreModules.js?compact=true";
import { installWorkerMessageListener } from "./WorkerListenerInstaller.js?compact=true";
import { runWorkerStage, runWorkerStageSync } from "./WorkerProgressTry.js?compact=true";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js?compact=true";

/** @returns {Promise<void>} */
export async function startOyvedEntrypoint() {
  try {
    postWorkerProgress("entrypoint:start");
    runWorkerStageSync("install-global-errors", () => installWorkerGlobalErrors());
    const state = runWorkerStageSync("create-worker-state", () => createWorkerBootState());
    const modules = await runWorkerStage("load-core-modules", async () => await loadWorkerCoreModules());
    runWorkerStageSync("install-message-listener", () => installWorkerMessageListener(state, modules.OyvedMessageInterpreter));
    runWorkerStageSync("start-worker-boot", () => startWorkerBoot(state, modules.OlamDynamicBoot));
    postWorkerProgress("entrypoint:done");
  } catch (error) {
    postPlainWorkerError(["WorkerEntrypoint failed", plainWorkerErrorText(error)].join(" || "), isPlainImportError(error));
  }
}
