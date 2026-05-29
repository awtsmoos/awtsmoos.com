// B"H
/**
 * @file OlamDynamicBoot.js
 * @description Chapter 75: the boot bridge pulls the fresh angelic invoker.
 * The Awtsmoos refuses a worker boot that remembers the 1x1 platform shadow.
 */
import { AngelicInvoker } from "./AngelicInvoker.js?v=wide-platform-real-boot-chain-20260529-bh75";

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
