
/**
 * B"H
 * @file AngelicInvoker.js
 * @description
 * Worker vessel invoker.
 *
 * Important:
 * vessel_ready is protocol, not a log.
 * It must always be posted or the main thread never sends pawsawch.
 */

import { ErrorHandler } from "./ErrorHandler.js";
import { importAngelicVesselsInOrder } from "./AngelicVesselImports.js";
import { makeSystemCore } from "./SystemCoreValidator.js";
import { postWorkerProtocol, postWorkerProgress } from "../protocol/WorkerProtocol.js";

/**
 * B"H
 * Invoker class.
 */
export class AngelicInvoker {
  /**
   * B"H
   * Imports Worker vessels and returns a ready SystemCore.
   *
   * @returns {Promise<{OlamClass:any,UtilsClass:any,isReady:boolean}>}
   * Ready SystemCore, or failed state handled by ErrorHandler.
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
