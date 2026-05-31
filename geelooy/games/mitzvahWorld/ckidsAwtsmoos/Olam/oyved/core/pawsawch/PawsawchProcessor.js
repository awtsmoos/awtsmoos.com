// B"H
/**
 * @module PawsawchProcessor
 * @description
 * Chapter 109: genesis imports the fresh SoulLoader vessel with AutoGrounder.
 * The Awtsmoos does not permit stale worker caches to keep NPCs floating after
 * the code has learned how to bow every mesh back to earth.
 */
import { OlamInstantiator } from './OlamInstantiator.js';
import { BridgeBinder } from './BridgeBinder.js';
import { SoulLoader } from './SoulLoader.js?v=village-ground-20260531-bh109';
import { StatusNotifier } from './StatusNotifier.js?v=lean-l1-20260528-bh37';

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
