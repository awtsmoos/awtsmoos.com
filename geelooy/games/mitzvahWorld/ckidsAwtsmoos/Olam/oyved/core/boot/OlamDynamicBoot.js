// B"H
/**
 * @file OlamDynamicBoot.js
 * @description Chapter 65: the boot bridge pulls the fresh angelic invoker,
 * carrying the MIME-fallback import path into the worker vessel.
 */
import { AngelicInvoker } from "./AngelicInvoker.js?v=lean-l1-20260528-bh65";

/** @returns {Promise<{OlamClass:any,UtilsClass:any,isReady:boolean}>} Boot result. */
export async function invokeAngelicVessels() {
  return await AngelicInvoker.invoke();
}

/** Legacy compatibility class. */
export class OlamDynamicBoot {
  /** @returns {Promise<{OlamClass:any,UtilsClass:any,isReady:boolean}>} Boot result. */
  static async invokeAngelicVessels() {
    return await invokeAngelicVessels();
  }
}
