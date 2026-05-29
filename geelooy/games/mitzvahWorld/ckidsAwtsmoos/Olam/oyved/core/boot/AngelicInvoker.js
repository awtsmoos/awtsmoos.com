// B"H
/**
 * @file AngelicInvoker.js
 * @description
 * Chapter 66: the invoker summons fresh vessel loaders. The Awtsmoos stands at
 * the worker threshold, not as a shadow in a Blob, but as exact paths, exact
 * exports, and exact readiness spoken back to the main world.
 */
import { ErrorHandler } from "./ErrorHandler.js?v=lean-l1-20260529-bh66";
import { importAngelicVesselsInOrder } from "./AngelicVesselImports.js?v=lean-l1-20260529-bh66";
import { makeSystemCore } from "./SystemCoreValidator.js?v=lean-l1-20260529-bh66";
import { postWorkerProtocol, postWorkerProgress } from "../protocol/WorkerProtocol.js?v=lean-l1-20260529-bh66";

export class AngelicInvoker {
  /**
   * Imports and validates the worker's world vessels.
   *
   * @returns {Promise<{OlamClass:any,UtilsClass:any,isReady:boolean}>}
   * Boot result consumed by the worker runtime.
   */
  static async invoke() {
    try {
      postWorkerProgress("angelic-invoker:start");
      postWorkerProgress("angelic-invoker:import-vessels:start");
      const imported = await importAngelicVesselsInOrder();
      postWorkerProgress("angelic-invoker:import-vessels:done");
      postWorkerProgress("angelic-invoker:make-system-core:start");
      const systemCore = makeSystemCore(imported.OlamClass, imported.UtilsClass);
      postWorkerProgress("angelic-invoker:make-system-core:done");
      postWorkerProtocol("vessel_ready", {
        text: "Worker vessels ready",
        message: "Worker vessels ready",
        details: "Worker vessels ready"
      });
      postWorkerProgress("angelic-invoker:done");
      return systemCore;
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}
