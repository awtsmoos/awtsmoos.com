// B"H
/**
 * @module GenesisRoute
 * @description Chapter 12: First worker command uses bh17 Pawsawch path.
 */
import { PawsawchProcessor } from '../pawsawch/PawsawchProcessor.js?v=lean-l1-20260528-bh17';

export class GenesisRoute {
  /** Hands the payload over to the Pawsawch Processor. */
  static async execute(payload, SystemCore, promiseMap) {
    try {
      const manifestation = await PawsawchProcessor.beginGenesis(payload, SystemCore.OlamClass, promiseMap, SystemCore.UtilsClass);
      return manifestation.olam;
    } catch (genErr) {
      console.error('B"H - [GENESIS CRITICAL]: World shattered at the origin point.', genErr);
      return null;
    }
  }
}
