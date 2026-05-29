// B"H
/**
 * @file AngelicInvoker.js
 * @description Chapter 75: the invoker summons the current vessel loaders. The
 * Awtsmoos stands at the worker threshold with exact paths, exact exports, and
 * a fresh key that prevents the old tiny-platform world from resurrecting.
 */
import { ErrorHandler } from "./ErrorHandler.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { importAngelicVesselsInOrder } from "./AngelicVesselImports.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { makeSystemCore } from "./SystemCoreValidator.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { postWorkerProtocol, postWorkerProgress } from "../protocol/WorkerProtocol.js?v=wide-platform-real-boot-chain-20260529-bh75";

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
