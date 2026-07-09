// B"H
/** Loads active tested core worker vessels, validates them, and announces readiness. */
import { ErrorHandler } from "./ErrorHandler.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { importAngelicVesselsInOrder } from "./AngelicVesselImports.js?compact=true&v=actual-tested-live-gates-20260709-bh5";
import { makeSystemCore } from "./SystemCoreValidator.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
import { postWorkerProtocol, postWorkerProgress } from "../protocol/WorkerProtocol.js?compact=true&v=worker-module-olam-index-fix-20260708-bh6";
export class AngelicInvoker { static async invoke() { try { postWorkerProgress("angelic-invoker:start"); postWorkerProgress("angelic-invoker:import-vessels:start"); const imported = await importAngelicVesselsInOrder(); postWorkerProgress("angelic-invoker:import-vessels:done"); postWorkerProgress("angelic-invoker:make-system-core:start"); const systemCore = makeSystemCore(imported.OlamClass, imported.UtilsClass); postWorkerProgress("angelic-invoker:make-system-core:done"); postWorkerProtocol("vessel_ready", { text:"Worker vessels ready", message:"Worker vessels ready", details:"Worker vessels ready", gate:"actual-tested-live-gates-20260709-bh5" }); postWorkerProgress("angelic-invoker:done"); return systemCore; } catch (error) { return ErrorHandler.handle(error); } } }
