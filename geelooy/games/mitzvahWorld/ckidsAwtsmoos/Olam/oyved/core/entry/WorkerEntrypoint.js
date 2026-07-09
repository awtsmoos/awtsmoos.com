// B"H
/**
 * @file WorkerEntrypoint.js
 * @description Installs worker boot state, imports core modules, and starts Olam.
 */
import { postPlainWorkerError } from "./PlainWorkerPost.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { installWorkerGlobalErrors } from "./WorkerGlobalErrors.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { createWorkerBootState } from "./WorkerBootState.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { startWorkerBoot } from "./WorkerBootRunner.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { loadWorkerCoreModules } from "./WorkerCoreModules.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { installWorkerMessageListener } from "./WorkerListenerInstaller.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { runWorkerStage, runWorkerStageSync } from "./WorkerProgressTry.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";

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
