// B"H
/** @file WorkerEntrypoint.js @description Entrypoint for bh9 no-alert jump-safe worker modules. */
import { postPlainWorkerError } from "./PlainWorkerPost.js?compact=true";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js?compact=true";
import { installWorkerGlobalErrors } from "./WorkerGlobalErrors.js?compact=true";
import { createWorkerBootState } from "./WorkerBootState.js?compact=true";
import { startWorkerBoot } from "./WorkerBootRunner.js?v=no-alert-perf-jump-20260701-bh9";
import { loadWorkerCoreModules } from "./WorkerCoreModules.js?v=no-alert-perf-jump-20260701-bh9";
import { installWorkerMessageListener } from "./WorkerListenerInstaller.js?compact=true";
import { runWorkerStage, runWorkerStageSync } from "./WorkerProgressTry.js?compact=true";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js?compact=true";
export async function startOyvedEntrypoint() { try { postWorkerProgress("entrypoint:start"); runWorkerStageSync("install-global-errors", () => installWorkerGlobalErrors()); const state = runWorkerStageSync("create-worker-state", () => createWorkerBootState()); const modules = await runWorkerStage("load-core-modules", async () => await loadWorkerCoreModules()); runWorkerStageSync("install-message-listener", () => installWorkerMessageListener(state, modules.OyvedMessageInterpreter)); runWorkerStageSync("start-worker-boot", () => startWorkerBoot(state, modules.OlamDynamicBoot)); postWorkerProgress("entrypoint:done"); } catch (error) { postPlainWorkerError(["WorkerEntrypoint failed", plainWorkerErrorText(error)].join(" || "), isPlainImportError(error)); } }
