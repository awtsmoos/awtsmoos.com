
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { GLTFLoader } from '/games/scripts/jsm/loaders/GLTFLoader.js';
import { ITEM_REGISTRY } from '../../../systems/inventory/data/registry.js';
import TextureForge from '../../../../utils/TextureForge/index.js';

/**
 * Loaders - Modular handlers for importing assets into the Olam.
 * Refined for absolute Worker compatibility and Procedural Texture Generation.
 */
export default {
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
     * Intercepts "awtsmoosTex://" to forge textures from the void!
     */
    async loadTexture({ url, shouldRepeat = false, repeatX = 1, repeatY = 1 }) {
        if (!url) return null;
        try {
            let finalUrl = url;

            // B"H: The Divine Interception. Forging reality from data.
            if (url.startsWith("awtsmoosTex://")) {
                const type = url.split("awtsmoosTex://")[1];
                finalUrl = await TextureForge.generate(type);
                console.log(`B"H - Procedurally forged texture: ${type}`);
            }

            const response = await fetch(finalUrl);
            if (!response.ok) throw new Error("B\"H: Fetch fail in loaders.");
            const blob = await response.blob();
            const imageBitmap = await createImageBitmap(blob, { imageOrientation: 'flipY' });
            const texture = new THREE.Texture(imageBitmap);
            if (shouldRepeat) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(repeatX, repeatY);
            }
            texture.needsUpdate = true; 
            return texture;
        } catch(err) {
            console.warn('B"H: Loaders texture error:', url, err);
            return null;
        }
    },
    
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
