// B"H
/**
 * @module PawsawchProcessor
 * @description
 * Chapter 25: Genesis Refused The Stale Earth-Hook.
 *
 * The Awtsmoos imports the repaired SoulLoader, where authored Y coordinates
 * remain sovereign and auto-grounding serves only decorative unpositioned props.
 */
import { OlamInstantiator } from './OlamInstantiator.js';
import { BridgeBinder } from './BridgeBinder.js';
import { SoulLoader } from './SoulLoader.js?v=respect-authored-y-20260602-bh7';
import { StatusNotifier } from './StatusNotifier.js?v=lean-l1-20260528-bh37';

export class PawsawchProcessor {
  /**
   * Begins world genesis inside the worker.
   *
   * @param {object} payload Worker payload.
   * @param {Function} OlamClass World class.
   * @param {Map} promiseMap Promise bridge map.
   * @param {Function} UtilsClass Utility class.
   * @returns {Promise<{olam: object}>} Created world.
   */
  static async beginGenesis(payload, OlamClass, promiseMap, UtilsClass) {
    StatusNotifier.forging();
    try {
      const olam = await OlamInstantiator.instantiate(OlamClass, payload);
      BridgeBinder.bind(olam, promiseMap, UtilsClass);
      await SoulLoader.load(olam, payload);
      StatusNotifier.completeSoon();
      return { olam };
    } catch (err) {
      StatusNotifier.error(err);
      throw err;
    }
  }
}
