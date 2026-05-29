// B"H
/**
 * @file OlamDynamicBoot.js
 * @description Chapter 88: the dynamic boot bridge pulls the angelic invoker
 * by exact static filename. The Awtsmoos removes query-masks from the worker
 * fatal path so the Olam can awaken and spawn the mezuzah.
 */
import { AngelicInvoker } from "./AngelicInvoker.js";

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
