// B"H
/**
 * @module PawsawchProcessor
 * @description Chapter 12: Genesis processor with bh17 notifier path.
 */
import { OlamInstantiator } from './OlamInstantiator.js';
import { BridgeBinder } from './BridgeBinder.js';
import { SoulLoader } from './SoulLoader.js';
import { StatusNotifier } from './StatusNotifier.js?v=lean-l1-20260528-bh17';

export class PawsawchProcessor {
  /** Begins world genesis inside the worker. */
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
