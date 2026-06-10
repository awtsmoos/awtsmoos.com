
// B"H
/**
 * @module LoadersModule
 * @description
 * Chapter 73: The loader index carries the model-load witness seal.
 */
import GLTFLoaderVessel from './GLTFLoaderVessel.js?v=chossid-model-load-20260610-bh709';
import TextureLoaderVessel from './TextureLoaderVessel.js';

export default {
  /** @param {string} url GLTF/GLB URL. @returns {Promise<object|null>} Loaded GLTF. */
  async loadGLTF(url) { return await GLTFLoaderVessel.load(url, this); },

  /** @param {object|string} options Texture options. @returns {Promise<object|null>} Texture. */
  async loadTexture(options) { return await TextureLoaderVessel.load(options); }
};
