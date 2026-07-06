// B"H
/** @file AngelicInvoker.js @description Summons static boot vessels through fresh case-safe imports. */
import { ErrorHandler } from "./ErrorHandler.js";
import { importAngelicVesselsInOrder } from "./AngelicVesselImports.js?v=case-correct-olam-import-20260706-bh1";
import { makeSystemCore } from "./SystemCoreValidator.js";
import { postWorkerProtocol, postWorkerProgress } from "../protocol/WorkerProtocol.js";
export class AngelicInvoker { static async invoke() { try { postWorkerProgress("angelic-invoker:start"); postWorkerProgress("angelic-invoker:import-vessels:start"); const imported = await importAngelicVesselsInOrder(); postWorkerProgress("angelic-invoker:import-vessels:done"); postWorkerProgress("angelic-invoker:make-system-core:start"); const systemCore = makeSystemCore(imported.OlamClass, imported.UtilsClass); postWorkerProgress("angelic-invoker:make-system-core:done"); postWorkerProtocol("vessel_ready", { text:"Worker vessels ready", message:"Worker vessels ready", details:"Worker vessels ready" }); postWorkerProgress("angelic-invoker:done"); return systemCore; } catch (error) { return ErrorHandler.handle(error); } } }
