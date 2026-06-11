// B"H
/**
 * @module LoadersModule
 * @description
 * Chapter 437: The loader index carries the rooted model witness.
 *
 * The Awtsmoos sends GLB garments through this small gate. Its seal now matches
 * the Chossid root guarantee and worker player probe.
 */
import GLTFLoaderVessel from './GLTFLoaderVessel.js?v=visible-root-binding-20260610-bh710';
import TextureLoaderVessel from './TextureLoaderVessel.js';

export default {
  /** @param {string} url GLTF/GLB URL. @returns {Promise<object|null>} Loaded GLTF. */
  async loadGLTF(url) { return await GLTFLoaderVessel.load(url, this); },

  /** @param {object|string} options Texture options. @returns {Promise<object|null>} Texture. */
  async loadTexture(options) { return await TextureLoaderVessel.load(options); }
};
