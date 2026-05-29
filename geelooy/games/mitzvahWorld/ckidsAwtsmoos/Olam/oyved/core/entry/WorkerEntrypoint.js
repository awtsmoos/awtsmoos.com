// B"H
/**
 * @file WorkerEntrypoint.js
 * @description Chapter 75: real worker entrypoint with the platform-size boot
 * key. The Awtsmoos refuses to let bh65 resurrect the old Olam while the level
 * cries for a wide bridge over lava.
 */
import { postPlainWorkerError } from "./PlainWorkerPost.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { installWorkerGlobalErrors } from "./WorkerGlobalErrors.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { createWorkerBootState } from "./WorkerBootState.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { startWorkerBoot } from "./WorkerBootRunner.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { loadWorkerCoreModules } from "./WorkerCoreModules.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { installWorkerMessageListener } from "./WorkerListenerInstaller.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { runWorkerStage, runWorkerStageSync } from "./WorkerProgressTry.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js?v=wide-platform-real-boot-chain-20260529-bh75";

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
