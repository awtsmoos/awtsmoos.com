// B"H
/** Loads core worker vessels, validates them, and announces readiness. */
import { ErrorHandler } from "./ErrorHandler.js";
import { importAngelicVesselsInOrder } from "./AngelicVesselImports.js";
import { makeSystemCore } from "./SystemCoreValidator.js";
import { postWorkerProtocol, postWorkerProgress } from "../protocol/WorkerProtocol.js";
const SEAL = "stable-direct-worker-boot-20260709-bh2";
export class AngelicInvoker {
  static async invoke() {
    try {
      postWorkerProgress("angelic-invoker:start");
      postWorkerProgress("angelic-invoker:import-vessels:start");
      const imported = await importAngelicVesselsInOrder();
      postWorkerProgress("angelic-invoker:import-vessels:done");
      postWorkerProgress("angelic-invoker:make-system-core:start");
      const systemCore = makeSystemCore(imported.OlamClass, imported.UtilsClass);
      postWorkerProgress("angelic-invoker:make-system-core:done");
      postWorkerProtocol("vessel_ready", { text:"Worker vessels ready", message:"Worker vessels ready", details:"Worker vessels ready", gate:SEAL });
      postWorkerProgress("angelic-invoker:done");
      return systemCore;
    } catch (error) { return ErrorHandler.handle(error); }
  }
}
