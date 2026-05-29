// B"H
/**
 * @module GenesisRoute
 * @description Chapter 29: Genesis enters through the fresh bh33 processor.
 */
import { PawsawchProcessor } from '../pawsawch/PawsawchProcessor.js?v=lean-l1-20260528-bh37';
export class GenesisRoute {
  /** Hands the payload over to the Pawsawch Processor. */
  static async execute(payload, SystemCore, promiseMap) {
    try { return (await PawsawchProcessor.beginGenesis(payload, SystemCore.OlamClass, promiseMap, SystemCore.UtilsClass)).olam; }
    catch (genErr) { console.error('B"H - [GENESIS CRITICAL]: World shattered at origin.', genErr); return null; }
  }
}
