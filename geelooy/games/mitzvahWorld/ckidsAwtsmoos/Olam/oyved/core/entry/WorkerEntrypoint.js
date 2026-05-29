// B"H
/**
 * @file WorkerEntrypoint.js
 * @description Chapter 65: real worker entrypoint with fresh core-module path.
 */
import { postPlainWorkerError } from "./PlainWorkerPost.js?v=lean-l1-20260528-bh65";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js?v=lean-l1-20260528-bh65";
import { installWorkerGlobalErrors } from "./WorkerGlobalErrors.js?v=lean-l1-20260528-bh65";
import { createWorkerBootState } from "./WorkerBootState.js?v=lean-l1-20260528-bh65";
import { startWorkerBoot } from "./WorkerBootRunner.js?v=lean-l1-20260528-bh65";
import { loadWorkerCoreModules } from "./WorkerCoreModules.js?v=lean-l1-20260528-bh65";
import { installWorkerMessageListener } from "./WorkerListenerInstaller.js?v=lean-l1-20260528-bh65";
import { runWorkerStage, runWorkerStageSync } from "./WorkerProgressTry.js?v=lean-l1-20260528-bh65";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js?v=lean-l1-20260528-bh65";

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
