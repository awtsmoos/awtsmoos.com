// B"H
/**
 * @file init.js
 * @description
 * Chapter 2: The loader no longer clutches the garment.
 *
 * The Awtsmoos reveals life through vessels, but no vessel may pretend it is
 * the Essence. This initializer once seized GLTFLoader and DRACOLoader through
 * static Three-side imports at module birth. Now it asks the renderer
 * capability membrane for those powers, allowing Node/headless tests to import
 * the initializer without dragging browser-only renderer limbs into the room.
 */
import { createRendererCapabilities } from './graphics/RendererCapabilities.js';

export default async function(olam) {
    const renderer = olam.rendererCapabilities || await createRendererCapabilities();
    olam.rendererCapabilities = renderer;

    if (!olam.loader) {
        console.warn("B\"H - ⚠️ 'olam.loader' was absent from the void. Asking renderer capabilities for a loader vessel.");
        olam.loader = renderer.createGltfLoader?.();
    }

    if (!olam.loader) {
        console.warn("B\"H - ⚠️ Renderer supplied no GLTFLoader. Continuing without browser model loading.");
        return true;
    }

    try {
        const dracoLoader = renderer.createDracoLoader?.();
        if (!dracoLoader) {
            console.warn("B\"H - ⚠️ Renderer supplied no DRACOLoader. Continuing with standard GLB speech.");
            return true;
        }

        dracoLoader.setDecoderPath('https://unpkg.com/three@0.170.0/examples/jsm/libs/draco/');

        if (typeof dracoLoader.preload === 'function') {
            dracoLoader.preload();
        }

        if (typeof olam.loader.setDRACOLoader === 'function') {
            olam.loader.setDRACOLoader(dracoLoader);
        } else {
            console.warn("B\"H - ⚠️ Loader vessel rejected Draco attachment (method missing). Continuing with standard speech.");
        }
    } catch (e) {
        console.error("B\"H - 🚨 Draco manifestation shattered. Reality will proceed through standard GLB only.", e);
    }

    return true;
}
