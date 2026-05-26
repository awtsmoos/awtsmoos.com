
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import AssetCache from '../../../../utils/assetCache/index.js';
import LoaderMonitor from './LoaderMonitor.js';
import ProceduralTextureInterceptor from './ProceduralTextureInterceptor.js';

const texturePromiseCache = new Map();

function textureCacheKey({ url, shouldRepeat = false, repeatX = 1, repeatY = 1 }) {
    return JSON.stringify({ url, shouldRepeat, repeatX, repeatY });
}

function canPersistUrl(url) {
    return typeof url === 'string' &&
        !url.startsWith('data:') &&
        !url.startsWith('blob:');
}

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

        const cacheKey = textureCacheKey({ url, shouldRepeat, repeatX, repeatY });
        if (texturePromiseCache.has(cacheKey)) {
            LoaderMonitor.logLoad("TEXTURE", url, "MEMORY_CACHE_HIT");
            return await texturePromiseCache.get(cacheKey);
        }

        LoaderMonitor.logLoad("TEXTURE", url, "INIT_BREATH");

        const promise = this.loadUncached({ url, shouldRepeat, repeatX, repeatY });
        texturePromiseCache.set(cacheKey, promise);
        return await promise;
    }

    static async loadUncached({ url, shouldRepeat = false, repeatX = 1, repeatY = 1 }) {
        const finalUrl = await ProceduralTextureInterceptor.intercept(url);

        try {
            let blob = canPersistUrl(finalUrl) ? await AssetCache.get(finalUrl) : null;

            if (!blob) {
                const response = await fetch(finalUrl);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                blob = await response.blob();

                if (canPersistUrl(finalUrl)) {
                    await AssetCache.put(finalUrl, blob);
                }
            }
            
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
