// B"H
/**
 * @file WorkerEntrypoint.js
 * @description Installs worker boot state, imports core modules, and starts Olam.
 */
import { postPlainWorkerError } from "./PlainWorkerPost.js";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js";
import { installWorkerGlobalErrors } from "./WorkerGlobalErrors.js";
import { createWorkerBootState } from "./WorkerBootState.js";
import { startWorkerBoot } from "./WorkerBootRunner.js?v=repair-ground-material-20260708-bh2";
import { loadWorkerCoreModules } from "./WorkerCoreModules.js?v=repair-ground-material-20260708-bh2";
import { installWorkerMessageListener } from "./WorkerListenerInstaller.js";
import { runWorkerStage, runWorkerStageSync } from "./WorkerProgressTry.js";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js";

/** B"H starts the worker entrypoint once its shell has loaded. */
export async function startOyvedEntrypoint() {
  try {
    postWorkerProgress("entrypoint:start");
    runWorkerStageSync("install-global-errors", () => installWorkerGlobalErrors());
    const state = runWorkerStageSync("create-worker-state", () => createWorkerBootState());
    const modules = await runWorkerStage("load-core-modules", () => loadWorkerCoreModules());
    runWorkerStageSync("install-message-listener", () => {
      installWorkerMessageListener(state, modules.OyvedMessageInterpreter);
    });
    runWorkerStageSync("start-worker-boot", () => startWorkerBoot(state, modules.OlamDynamicBoot));
    postWorkerProgress("entrypoint:done");
  } catch (error) {
    postPlainWorkerError(
      ["WorkerEntrypoint failed", plainWorkerErrorText(error)].join(" || "),
      isPlainImportError(error)
    );
  }
}
