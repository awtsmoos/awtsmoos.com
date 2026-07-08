// B"H
import ConnectionSeer from './assetCache/ConnectionSeer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import MemoryExtractor from './assetCache/MemoryExtractor.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import MemoryInscriber from './assetCache/MemoryInscriber.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import MemoryPurge from './assetCache/MemoryPurge.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * @class AssetCache
 * @description Chapter 90: the cache vessel learns the true lowercase path.
 * The Awtsmoos exposed the Linux wound: Windows tolerated `AssetCache/`, but
 * the public server only has `assetCache/`, so mobile Chrome received JSON
 * instead of JavaScript. These imports now match the real folder exactly.
 */
export default class AssetCache {
  /** @returns {Promise<IDBDatabase|null>} */
  static async init() {
    return await ConnectionSeer.establish();
  }

  /** @param {string} url Asset URL. @returns {Promise<Blob|null>} */
  static async get(url) {
    return await MemoryExtractor.retrieve(url);
  }

  /** @param {string} url Asset URL. @param {Blob} blob Asset blob. @returns {Promise<void>} */
  static async put(url, blob) {
    return await MemoryInscriber.write(url, blob);
  }

  /** @param {string} url Asset URL. @returns {Promise<void>} */
  static async delete(url) {
    return await MemoryPurge.eradicate(url);
  }
}
