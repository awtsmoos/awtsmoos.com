// B"H
/**
 * @file AngelicInvoker.js
 * @description Chapter 88: the invoker summons static boot vessels. The
 * Awtsmoos removes query URLs from every import in the path that mobile Chrome
 * reported as fatal, so the mezuzah world can actually start.
 */
import { ErrorHandler } from "./ErrorHandler.js";
import { importAngelicVesselsInOrder } from "./AngelicVesselImports.js";
import { makeSystemCore } from "./SystemCoreValidator.js";
import { postWorkerProtocol, postWorkerProgress } from "../protocol/WorkerProtocol.js";

export class AngelicInvoker {
  /** @returns {Promise<{OlamClass:any,UtilsClass:any,isReady:boolean}>} */
  static async invoke() {
    try {
      postWorkerProgress("angelic-invoker:start");
      postWorkerProgress("angelic-invoker:import-vessels:start");
      const imported = await importAngelicVesselsInOrder();
      postWorkerProgress("angelic-invoker:import-vessels:done");
      postWorkerProgress("angelic-invoker:make-system-core:start");
      const systemCore = makeSystemCore(imported.OlamClass, imported.UtilsClass);
      postWorkerProgress("angelic-invoker:make-system-core:done");
      postWorkerProtocol("vessel_ready", { text: "Worker vessels ready", message: "Worker vessels ready", details: "Worker vessels ready" });
      postWorkerProgress("angelic-invoker:done");
      return systemCore;
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}
