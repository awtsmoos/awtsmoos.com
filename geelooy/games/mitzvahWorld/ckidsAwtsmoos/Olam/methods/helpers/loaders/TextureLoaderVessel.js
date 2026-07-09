// B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import AssetCache from '../../../../utils/assetCache/index.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import LoaderMonitor from './LoaderMonitor.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import ProceduralTextureInterceptor from './ProceduralTextureInterceptor.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

const texturePromiseCache = new Map();

function textureCacheKey({ url, shouldRepeat = false, repeatX = 1, repeatY = 1 }) {
    return JSON.stringify({ url, shouldRepeat, repeatX, repeatY });
}

function canPersistUrl(url) {
    return typeof url === 'string' && !url.startsWith('data:') && !url.startsWith('blob:');
}

function rendererAnisotropy() {
    try {
        const renderer = globalThis.__AWTSMOOS_RENDERER__ || globalThis.renderer || globalThis.mana?.renderer;
        return renderer?.capabilities?.getMaxAnisotropy?.() || 8;
    } catch {
        return 8;
    }
}

function applyRealisticTextureDefaults(texture, { shouldRepeat, repeatX, repeatY }) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = Math.max(Number(texture.anisotropy) || 1, Math.min(16, rendererAnisotropy()));
    if (shouldRepeat) {
        texture.wrapS = THREE.MirroredRepeatWrapping;
        texture.wrapT = THREE.MirroredRepeatWrapping;
        texture.repeat.set(repeatX, repeatY);
    } else {
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
    }
    texture.userData ||= {};
    texture.userData.awtsmoosRealisticTextureDefaults = {
        mipmaps: true,
        anisotropy: texture.anisotropy,
        mirroredRepeat: Boolean(shouldRepeat),
        repeatX,
        repeatY,
        at: Date.now()
    };
    texture.needsUpdate = true;
}

/**
 * B"H
 * @class TextureLoaderVessel
 * @description
 * The painter of light now refuses blurry, pixelated maps at the gate: every
 * loaded texture receives mipmaps, linear filtering, anisotropy, color space,
 * and optional mirrored repeat before it enters the world.
 */
export default class TextureLoaderVessel {
    static async load({ url, shouldRepeat = false, repeatX = 1, repeatY = 1 }) {
        if (!url) {
            LoaderMonitor.logLoad('TEXTURE', 'null', 'ABORTED');
            return null;
        }
        const cacheKey = textureCacheKey({ url, shouldRepeat, repeatX, repeatY });
        if (texturePromiseCache.has(cacheKey)) {
            LoaderMonitor.logLoad('TEXTURE', url, 'MEMORY_CACHE_HIT');
            return await texturePromiseCache.get(cacheKey);
        }
        LoaderMonitor.logLoad('TEXTURE', url, 'INIT_BREATH');
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
                if (canPersistUrl(finalUrl)) await AssetCache.put(finalUrl, blob);
            }
            const imageBitmap = await createImageBitmap(blob, { imageOrientation: 'flipY' });
            const texture = new THREE.Texture(imageBitmap);
            applyRealisticTextureDefaults(texture, { shouldRepeat, repeatX, repeatY });
            if (!texture.matrix) texture.matrix = new THREE.Matrix3();
            if (texture.channel === undefined) texture.channel = 0;
            LoaderMonitor.logLoad('TEXTURE', url, 'PAINTED_REALISTIC');
            return texture;
        } catch (err) {
            LoaderMonitor.logLoad('TEXTURE', url, 'FAILED');
            console.warn(`B"H - ⚠️ Visual fetch collapsed: ${finalUrl}`, err.message);
            texturePromiseCache.delete(textureCacheKey({ url, shouldRepeat, repeatX, repeatY }));
            return null;
        }
    }
}
