
/**
 * B"H
 * @file OlamDynamicBoot.js
 * @description
 * Stable boot bridge.
 *
 * Exports both:
 * - function invokeAngelicVessels
 * - class OlamDynamicBoot
 *
 * This protects older code and newer split modules at the same time.
 */

import { AngelicInvoker } from "./AngelicInvoker.js";

/**
 * B"H
 * Invokes Worker vessels.
 *
 * @returns {Promise<{OlamClass:any,UtilsClass:any,isReady:boolean}>}
 * Boot result.
 */
export async function invokeAngelicVessels() {
  return await AngelicInvoker.invoke();
}

/**
 * B"H
 * Legacy compatibility class.
 */
export class OlamDynamicBoot {
  /**
   * B"H
   * Legacy static method.
   *
   * @returns {Promise<{OlamClass:any,UtilsClass:any,isReady:boolean}>}
   * Boot result.
   */
  static async invokeAngelicVessels() {
    return await invokeAngelicVessels();
  }
}
