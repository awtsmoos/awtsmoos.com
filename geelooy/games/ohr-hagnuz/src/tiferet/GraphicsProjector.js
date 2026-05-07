import { StateRegister } from '../binah/StateRegister.js';
import { MapRenderEngine } from '../graphics/MapRenderEngine.js';

/**
 * B"H
 * @chapter The Throne of Beauty (Tiferet)
 * @description
 * Tiferet is the heart of the system, balancing the infinite expansion 
 * of Chochmah and the structured contraction of Binah. 
 * 
 * We maintain the caches for our three canvases. 
 * emanateLight() is the ritual that transforms our internal thoughts 
 * (state) into the visible beauty of the orchard and the Tzaddik.
 */
export class GraphicsProjector {
    static Caches = {
        BG: null,
        OBJ: null,
        OVER: null
    };

    /**
     * @description Locates the canvas elements and caches their context.
     */
    static warmupCanvases() {
        const layers = {
            BG: 'layer-bg',
            OBJ: 'layer-obj',
            OVER: 'layer-over'
        };

        for (const [key, id] of Object.entries(layers)) {
            const canvas = document.getElementById(id);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false; // Preserve the sharp truth of paths
                this.Caches[key] = ctx;
            } else {
                console.warn(`B"H - Warning: Vessel ${id} is not manifest.`);
            }
        }
    }

    /**
     * @description Projects the light of the current world.
     */
    static emanateLight() {
        if (!this.Caches.BG || !this.Caches.OBJ) return;

        // Routing through our procedural rendering mode
        // For now, all realms are treated as World Maps
        MapRenderEngine.draw(this.Caches);
    }
}