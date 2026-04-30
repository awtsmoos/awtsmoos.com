
import { StateRegister } from '../binah/StateRegister.js';
import { RendererMap } from './RendererMap.js';

/**
 * B"H
 * Tiferet forms the beauty and synthesis of truth.
 * Clears away the Tohu (chaos) and paints Tikun (Order).
 * Extremely minimal object mappings replace all conditional branching.
 */
export class GraphicsProjector {
    static Caches = {};

    static warmupCanvases() {
        const Cfg = { alpha: false, imageSmoothingEnabled: false };
        this.Caches.BG = document.getElementById('layer-bg').getContext('2d', Cfg);
        this.Caches.OBJ = document.getElementById('layer-obj').getContext('2d');
        this.Caches.OVER = document.getElementById('layer-over').getContext('2d');
        
        // Anti-aliasing must be strictly defeated to protect pure pixel edges
        Object.values(this.Caches).forEach(cx => cx.imageSmoothingEnabled = false);
    }

    /** Projects reality dictated solely by the specific Dimension currently inhabited. */
    static emanateLight() {
        const mode = StateRegister.ActiveRealm; // 'OVERWORLD', 'DIALOGUE', 'BATTLE'
        
        // Execute dynamic mappings to specific render objects logically (Avoiding switch!)
        const RenderingAxiom = RendererMap[mode] || RendererMap['VOID'];
        RenderingAxiom.executePaintSequence(this.Caches);
    }
}
