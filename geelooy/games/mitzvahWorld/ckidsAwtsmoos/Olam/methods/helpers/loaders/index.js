
// B"H
/**
 * @module LoadersModule
 * @description
 * ==============================================================================
 * 🪐 THE CONDUIT OF MATTER AND LIGHT (YETZIRAH) 🪐
 * ==============================================================================
 * Unifying the shattered fragments back into a comprehensive entry point.
 */
import GLTFLoaderVessel from './GLTFLoaderVessel.js?v=player-gltf-sanitize-20260527';
import TextureLoaderVessel from './TextureLoaderVessel.js';

export default {
    /**
     * Extracts heavy meshes and animations.
     */
    async loadGLTF(url) {
        return await GLTFLoaderVessel.load(url, this);
    },

    /**
     * Extracts paints and textures.
     */
    async loadTexture(options) {
        return await TextureLoaderVessel.load(options);
    }
};
