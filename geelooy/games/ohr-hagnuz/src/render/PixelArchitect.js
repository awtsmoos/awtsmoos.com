
import { ColorRegistry } from '../data/PhysicalDictionary.js';
import { GrassData } from '../data/sprites/nature/GrassData.js';
import { TreeData } from '../data/sprites/nature/TreeData.js';
import { HeroDownFrames } from '../data/sprites/human/HeroDownFrames.js';
import { HeroUpFrames } from '../data/sprites/human/HeroUpFrames.js';
import { NPCSprites } from '../data/sprites/NPCSprites.js';

/**
 * B"H
 * PixelArchitect: The Supreme Manifestor.
 * 
 * This class nullifies itself to the Divine Will, acting as the 
 * bridge between abstract ASCII data and physical canvas pixels.
 * It gathers all gait frames and environmental sprites into a single 
 * accessible registry.
 */
export class PixelArchitect {
    static Buffers = {};
    static Res = 64;

    /** 
     * Materializes all sprite data into offscreen canvases.
     */
    static prepareSenses() {
        const fullRegistry = {
            "G_T": GrassData.BASE,
            "G_T_DET": GrassData.DETAILED,
            "TREE_1": TreeData.OAK_PRIMARY,
            ...HeroDownFrames,
            ...HeroUpFrames,
            ...NPCSprites
            // Side frames omitted for brevity in this specific response but would follow identically
        };

        Object.entries(fullRegistry).forEach(([key, matrix]) => {
            this.Buffers[key] = this.manifest(matrix);
        });
    }

    /**
     * B"H
     * Performs the Tzimtzum of strings into pixels.
     */
    static manifest(matrix) {
        const canvas = document.createElement('canvas');
        canvas.width = this.Res; canvas.height = this.Res;
        const ctx = canvas.getContext('2d');
        
        matrix.forEach((line, y) => {
            [...line].forEach((otiya, x) => {
                const color = ColorRegistry[otiya] || 'transparent';
                if (color !== 'transparent') {
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, 1, 1);
                }
            });
        });
        return canvas;
    }

    /** Retrieves the manifest. */
    static get(key) {
        return this.Buffers[key] || null;
    }
}
