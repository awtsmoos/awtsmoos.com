
/**
 * B"H
 * @file WorkerEntrypoint.js
 * @description
 * Real Worker entrypoint.
 *
 * Fixes:
 * - no duplicate boot imports
 * - boot modules load once
 * - listener installs once
 * - Olam boot receives the already-loaded OlamDynamicBoot class
 */

import { postPlainWorkerText, postPlainWorkerError } from "./PlainWorkerPost.js";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js";
import { installWorkerGlobalErrors } from "./WorkerGlobalErrors.js";
import { createWorkerBootState } from "./WorkerBootState.js";
import { startWorkerBoot } from "./WorkerBootRunner.js";
import { loadWorkerCoreModules } from "./WorkerCoreModules.js";
import { installWorkerMessageListener } from "./WorkerListenerInstaller.js";

/**
 * B"H
 * Starts the Worker entrypoint.
 *
 * @returns {Promise<void>}
 */
export async function startOyvedEntrypoint() {
  try {
    installWorkerGlobalErrors();
    postPlainWorkerText("worker_text_log", "WorkerEntrypoint started");

    const state = createWorkerBootState();
    const modules = await loadWorkerCoreModules();

    installWorkerMessageListener(state, modules.OyvedMessageInterpreter);
    startWorkerBoot(state, modules.OlamDynamicBoot);
  } catch (error) {
    const text = [
      "WorkerEntrypoint failed",
      plainWorkerErrorText(error)
    ].join(" || ");

    postPlainWorkerError(text, isPlainImportError(error));
  }
}
