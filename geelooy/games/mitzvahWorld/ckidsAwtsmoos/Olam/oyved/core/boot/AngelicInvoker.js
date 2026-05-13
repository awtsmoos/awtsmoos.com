
/**
 * B"H
 * @file AngelicInvoker.js
 * @description
 * Worker vessel invoker.
 *
 * This version permanently avoids the bad ./core.js default-export assumption.
 */

import { ErrorHandler } from "./ErrorHandler.js";
import { importAngelicVesselsInOrder } from "./AngelicVesselImports.js";
import { makeSystemCore } from "./SystemCoreValidator.js";
import { workerBootLog, postTextToMain } from "../log/WorkerTextLogger.js";

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
      workerBootLog.info("Worker vessel invocation started");
      postTextToMain("worker_text_log", "Worker vessel invocation started");

      const imported = await importAngelicVesselsInOrder();
      const systemCore = makeSystemCore(imported.OlamClass, imported.UtilsClass);

      workerBootLog.info("Worker vessels ready");
      postTextToMain("vessel_ready", "Worker vessels ready");

      return systemCore;
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}
