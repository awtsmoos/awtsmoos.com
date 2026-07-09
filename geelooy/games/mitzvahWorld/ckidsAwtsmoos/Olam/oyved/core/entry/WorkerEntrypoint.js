// B"H
/** Worker entrypoint with active tested worker core module import. */
import { postPlainWorkerError } from "./PlainWorkerPost.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { plainWorkerErrorText, isPlainImportError } from "./PlainWorkerErrorText.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { installWorkerGlobalErrors } from "./WorkerGlobalErrors.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { createWorkerBootState } from "./WorkerBootState.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { startWorkerBoot } from "./WorkerBootRunner.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { loadWorkerCoreModules } from "./WorkerCoreModules.js?compact=true&v=actual-tested-live-gates-20260709-bh5";
import { installWorkerMessageListener } from "./WorkerListenerInstaller.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { runWorkerStage, runWorkerStageSync } from "./WorkerProgressTry.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
export async function startOyvedEntrypoint() { try { postWorkerProgress("entrypoint:start", { gate:"actual-tested-live-gates-20260709-bh5" }); runWorkerStageSync("install-global-errors", () => installWorkerGlobalErrors()); const state = runWorkerStageSync("create-worker-state", () => createWorkerBootState()); const modules = await runWorkerStage("load-core-modules", () => loadWorkerCoreModules()); runWorkerStageSync("install-message-listener", () => installWorkerMessageListener(state, modules.OyvedMessageInterpreter)); runWorkerStageSync("start-worker-boot", () => startWorkerBoot(state, modules.OlamDynamicBoot)); postWorkerProgress("entrypoint:done", { gate:"actual-tested-live-gates-20260709-bh5" }); } catch (error) { postPlainWorkerError(["WorkerEntrypoint failed", plainWorkerErrorText(error)].join(" || "), isPlainImportError(error)); } }
