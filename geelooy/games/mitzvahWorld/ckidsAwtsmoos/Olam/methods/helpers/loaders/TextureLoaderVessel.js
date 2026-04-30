
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import LoaderMonitor from './LoaderMonitor.js';
import ProceduralTextureInterceptor from './ProceduralTextureInterceptor.js';

/**
 * B"H
 * @class TextureLoaderVessel
 * @description
 * ==============================================================================
 * 🎨 THE PAINTER OF LIGHT (BEZALEL) 🎨
 * ==============================================================================
 * TextureLoaderVessel governs the extraction of flat 2D maps, intercepting calls 
 * to dynamic `awtsmoostex://` namespaces and safely compiling image blocks 
 * asynchronously utilizing the absolute non-blocking power of `createImageBitmap`.
 */
export default class TextureLoaderVessel {
    /**
     * @method load
     * @description Fetches raw colors into unified memory chunks.
     * @param {Object} options 
     * @param {string} options.url 
     * @param {boolean} [options.shouldRepeat=false]
     * @returns {Promise<THREE.Texture|null>}
     */
    static async load({ url, shouldRepeat = false, repeatX = 1, repeatY = 1 }) {
        if (!url) {
            LoaderMonitor.logLoad("TEXTURE", "null", "ABORTED");
            return null;
        }

        LoaderMonitor.logLoad("TEXTURE", url, "INIT_BREATH");

        // B"H: Intercept and forge procedural textures (bricks, stone, etc)
        const finalUrl = await ProceduralTextureInterceptor.intercept(url);

        try {
            const response = await fetch(finalUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const blob = await response.blob();
            
            // Asynchronous decoding on background thread logic
            const imageBitmap = await createImageBitmap(blob, { imageOrientation: 'flipY' });
            
            const texture = new THREE.Texture(imageBitmap);
            texture.colorSpace = THREE.SRGBColorSpace;
            
            if (shouldRepeat) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(repeatX, repeatY);
            }
            
            texture.needsUpdate = true;

            // Absolute barrier to prevent corrupted shaders attempting math on undefined space
            if (!texture.matrix) texture.matrix = new THREE.Matrix3();
            if (texture.channel === undefined) texture.channel = 0;

            LoaderMonitor.logLoad("TEXTURE", url, "PAINTED");
            return texture;
        } catch(err) {
            LoaderMonitor.logLoad("TEXTURE", url, "FAILED");
            console.warn(`B"H - ⚠️ Visual fetch collapsed: ${finalUrl}`, err.message);
            return null; 
        }
    }
}
