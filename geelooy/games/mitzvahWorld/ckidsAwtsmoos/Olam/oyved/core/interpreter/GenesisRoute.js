// B"H
/**
 * @module GenesisRoute
 * @description
 * Chapter 26: Genesis Cut The Last Stale Thread.
 *
 * The Awtsmoos sends world creation through the processor that respects
 * authored Y coordinates, so lava gameplay objects remain exactly where JSON
 * placed them.
 */
import { PawsawchProcessor } from '../pawsawch/PawsawchProcessor.js?v=respect-authored-y-20260602-bh7';

export class GenesisRoute {
  /**
   * Hands the payload over to the Pawsawch Processor.
   *
   * @param {object} payload Worker payload.
   * @param {object} SystemCore Core classes.
   * @param {Map} promiseMap Promise bridge.
   * @returns {Promise<object|null>} Created world or null.
   */
  static async execute(payload, SystemCore, promiseMap) {
    try {
      return (await PawsawchProcessor.beginGenesis(payload, SystemCore.OlamClass, promiseMap, SystemCore.UtilsClass)).olam;
    } catch (genErr) {
      console.error('B"H - [GENESIS CRITICAL]: World shattered at origin.', genErr);
      return null;
    }
  }
}
