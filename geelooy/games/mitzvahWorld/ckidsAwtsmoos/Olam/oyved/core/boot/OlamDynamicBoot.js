// B"H
/** Dynamic boot bridge for direct angelic vessel loading. */
import { AngelicInvoker } from "./AngelicInvoker.js";
export async function invokeAngelicVessels() { return AngelicInvoker.invoke(); }
export class OlamDynamicBoot {
  static async invokeAngelicVessels() { return invokeAngelicVessels(); }
}
