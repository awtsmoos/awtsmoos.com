// B"H
/**
 * @module PawsawchProcessor
 * @description
 * Chapter 573: Genesis now leaves footprints through the dark corridor.
 *
 * The Awtsmoos creates the Olam from nothing every instant, yet the worker must
 * reveal where creation pauses: instantiate, bind, load souls, complete. These
 * compact progress marks are not noisy logs; they are a trail of sparks for the
 * main-thread proof vessel.
 */
import { OlamInstantiator } from './OlamInstantiator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { BridgeBinder } from './BridgeBinder.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { SoulLoader } from './SoulLoader.js?compact=true&v=genesis-trace-20260612-bh1';
import { StatusNotifier } from './StatusNotifier.js?compact=true&v=lean-l1-20260528-bh37';
import { postWorkerProgress } from '../protocol/WorkerProtocol.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

function payloadKind(payload) {
  const worldData = payload?.userInfo || payload || {};
  return {
    id: worldData?.id || null,
    shaym: worldData?.shaym || null,
    nivrayimKeys: worldData?.nivrayim ? Object.keys(worldData.nivrayim).length : 0
  };
}

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
    const startedAt = performance.now();
    postWorkerProgress('pawsawch:genesis:start', payloadKind(payload));
    StatusNotifier.forging();
    try {
      postWorkerProgress('pawsawch:instantiate:start');
      const olam = await OlamInstantiator.instantiate(OlamClass, payload);
      postWorkerProgress('pawsawch:instantiate:done', { elapsedMs: Math.round(performance.now() - startedAt) });

      postWorkerProgress('pawsawch:bridge:start');
      BridgeBinder.bind(olam, promiseMap, UtilsClass);
      postWorkerProgress('pawsawch:bridge:done');

      postWorkerProgress('pawsawch:soul-loader:start');
      await SoulLoader.load(olam, payload);
      postWorkerProgress('pawsawch:soul-loader:done', { elapsedMs: Math.round(performance.now() - startedAt) });

      StatusNotifier.completeSoon();
      postWorkerProgress('pawsawch:complete-scheduled', { elapsedMs: Math.round(performance.now() - startedAt) });
      return { olam };
    } catch (err) {
      postWorkerProgress('pawsawch:genesis:error', {
        message: err?.message || String(err),
        stack: String(err?.stack || '').slice(0, 600)
      });
      StatusNotifier.error(err);
      throw err;
    }
  }
}
