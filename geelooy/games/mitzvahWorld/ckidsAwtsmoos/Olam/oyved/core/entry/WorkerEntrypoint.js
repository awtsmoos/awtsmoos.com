
/**
 * B"H
 * @file WorkerEntrypoint.js
 * @description
 * Real Worker entrypoint with progress checkpoints.
 */

import { postPlainWorkerError } from "./PlainWorkerPost.js";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js";
import { installWorkerGlobalErrors } from "./WorkerGlobalErrors.js";
import { createWorkerBootState } from "./WorkerBootState.js";
import { startWorkerBoot } from "./WorkerBootRunner.js";
import { loadWorkerCoreModules } from "./WorkerCoreModules.js";
import { installWorkerMessageListener } from "./WorkerListenerInstaller.js";
import { runWorkerStage, runWorkerStageSync } from "./WorkerProgressTry.js";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js";

/**
 * B"H
 * Starts the Worker entrypoint.
 *
 * @returns {Promise<void>}
 */
export async function startOyvedEntrypoint() {
  try {
    postWorkerProgress("entrypoint:start");

    runWorkerStageSync("install-global-errors", () => {
      installWorkerGlobalErrors();
    });

    const state = runWorkerStageSync("create-worker-state", () => {
      return createWorkerBootState();
    });

    const modules = await runWorkerStage("load-core-modules", async () => {
      return await loadWorkerCoreModules();
    });

    runWorkerStageSync("install-message-listener", () => {
      installWorkerMessageListener(state, modules.OyvedMessageInterpreter);
    });

    runWorkerStageSync("start-worker-boot", () => {
      startWorkerBoot(state, modules.OlamDynamicBoot);
    });

    postWorkerProgress("entrypoint:done");
  } catch (error) {
    const text = [
      "WorkerEntrypoint failed",
      plainWorkerErrorText(error)
    ].join(" || ");

    postPlainWorkerError(text, isPlainImportError(error));
  }
}
