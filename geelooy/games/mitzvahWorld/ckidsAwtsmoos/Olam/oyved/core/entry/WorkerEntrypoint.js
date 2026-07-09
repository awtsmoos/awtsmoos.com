// B"H
/** Worker entrypoint with direct, stable imports. */
import { postPlainWorkerError } from "./PlainWorkerPost.js";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js";
import { installWorkerGlobalErrors } from "./WorkerGlobalErrors.js";
import { createWorkerBootState } from "./WorkerBootState.js";
import { startWorkerBoot } from "./WorkerBootRunner.js";
import { loadWorkerCoreModules } from "./WorkerCoreModules.js";
import { installWorkerMessageListener } from "./WorkerListenerInstaller.js";
import { runWorkerStage, runWorkerStageSync } from "./WorkerProgressTry.js";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js";
const SEAL = "stable-direct-worker-boot-20260709-bh2";
export async function startOyvedEntrypoint() {
  try {
    postWorkerProgress("entrypoint:start", { gate:SEAL });
    runWorkerStageSync("install-global-errors", () => installWorkerGlobalErrors());
    const state = runWorkerStageSync("create-worker-state", () => createWorkerBootState());
    const modules = await runWorkerStage("load-core-modules", () => loadWorkerCoreModules());
    runWorkerStageSync("install-message-listener", () => installWorkerMessageListener(state, modules.OyvedMessageInterpreter));
    runWorkerStageSync("start-worker-boot", () => startWorkerBoot(state, modules.OlamDynamicBoot));
    postWorkerProgress("entrypoint:done", { gate:SEAL });
  } catch (error) {
    postPlainWorkerError(["WorkerEntrypoint failed", plainWorkerErrorText(error)].join(" || "), isPlainImportError(error));
  }
}
