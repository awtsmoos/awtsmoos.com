// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { GLTFLoader } from '/games/scripts/jsm/loaders/GLTFLoader.js';
import { ITEM_REGISTRY } from '../../../systems/inventory/data/registry.js';

/**
 * Loaders - Modular handlers for importing assets into the Olam.
 * Refined for absolute Worker compatibility.
 */
export default {
    /**
     * B"H
     * loadGLTF - Manifests a form from its digital blueprint.
     * @param {string} url 
     */
    async loadGLTF(url) {
        try {
            const gltf = await (new GLTFLoader().loadAsync(url));
            return gltf;
        } catch(e) {
            console.log(e);
            return null;
        }
    },

    /**
     * B"H
     * loadTexture - Draws a texture from the infinite potential into the physical world.
     * Re-engineered to avoid all document dependencies in Worker context.
     * @param {Object} options
     */
    async loadTexture({ url, shouldRepeat = false, repeatX = 1, repeatY = 1 }) {
        if (!url) return null;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("B\"H: Fetch fail in loaders.");
            const blob = await response.blob();
            const imageBitmap = await createImageBitmap(blob, { imageOrientation: 'flipY' });
            const texture = new THREE.Texture(imageBitmap);
            if (shouldRepeat) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(repeatX, repeatY);
            }
            texture.needsUpdate = true; // B"H: CRITICAL for manifesting on GPU
            return texture;
        } catch(err) {
            console.warn('B"H: Loaders texture error:', url, err);
            return null;
        }
    },
    
    /**
     * B"H
     * getIconFromType - Retrieves the sacred icon for an item type.
     */
    async getIconFromType(type) {
		if(type && typeof(type) == "string") {
			const itemData = ITEM_REGISTRY[type];
			if(itemData && itemData.icon) {
                if(itemData.icon.startsWith("<svg") || itemData.icon.startsWith("data:")) {
                    return itemData.icon;
                }
                if(itemData.icon.endsWith(".js")) {
                    try {
                        const module = await import(itemData.icon);
                        return module.default;
                    } catch(e) {
                        console.warn("B\"H: Failed to load icon module", e);
                    }
                }
                return itemData.icon;
			}
		}
		return null;
    }
};
