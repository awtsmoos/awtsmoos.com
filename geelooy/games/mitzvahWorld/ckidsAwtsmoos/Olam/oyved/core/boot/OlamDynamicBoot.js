// B"H
/**
 * @file OlamDynamicBoot.js
 * @description Dynamic boot bridge for case-safe angelic vessel loading.
 */
import { AngelicInvoker } from "./AngelicInvoker.js?compact=true&v=repair-ground-material-20260708-bh2";

/** @returns {Promise<object>} B"H validated worker system core. */
export async function invokeAngelicVessels() {
  return AngelicInvoker.invoke();
}

/** B"H static facade retained for the worker boot contract. */
export class OlamDynamicBoot {
  /** @returns {Promise<object>} B"H validated worker system core. */
  static async invokeAngelicVessels() {
    return invokeAngelicVessels();
  }
}
