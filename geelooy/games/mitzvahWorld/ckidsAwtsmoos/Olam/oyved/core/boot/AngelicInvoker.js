// B"H
/**
 * @file AngelicInvoker.js
 * @description Loads core worker vessels, validates them, and announces readiness.
 */
import { ErrorHandler } from "./ErrorHandler.js";
import { importAngelicVesselsInOrder } from "./AngelicVesselImports.js?v=repair-ground-material-20260708-bh2";
import { makeSystemCore } from "./SystemCoreValidator.js";
import { postWorkerProtocol, postWorkerProgress } from "../protocol/WorkerProtocol.js";

/** B"H boot invoker for the worker's core Olam and utility vessels. */
export class AngelicInvoker {
  /** @returns {Promise<object>} Validated worker core exports. */
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
