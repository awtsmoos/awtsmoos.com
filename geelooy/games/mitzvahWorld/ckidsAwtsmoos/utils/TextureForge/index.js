
/**
 * B"H
 * @module TextureForge
 * @description
 * The ultimate Forge of Form. This module intercepts requests for divine patterns 
 * (awtsmoosTex://...) and crystallizes them into physical data (Blob URLs) that the 
 * game engine can render. It is the transition from Atzilut (Emanation) to Beriah (Creation).
 */

import BarkGenerator from "./Generators/Bark.js";
import LeafGenerator from "./Generators/Leaf.js";
import SandGenerator from "./Generators/Sand.js";
import GrassGenerator from "./Generators/Grass.js";
import StoneGenerator from "./Generators/Stone.js";
import BasicPlane from "./Generators/BasicPlane.js"; // B"H: New Basic Texture

export default class TextureForge {
    static cache = new Map();

    /**
     * @async
     * @function generate
     * @description Generates a texture based on the requested archetype.
     * @param {string} type - 'bark', 'leaf', 'sand', 'grass', 'stone', or 'basic'.
     * @returns {Promise<string>} A Blob URL representing the generated image.
     */
    static async generate(type) {
        if (this.cache.has(type)) {
            return this.cache.get(type);
        }

        let canvas;
        switch(type.toLowerCase()) {
            case 'bark': canvas = BarkGenerator.generate(); break;
            case 'leaf': canvas = LeafGenerator.generate(); break;
            case 'sand': canvas = SandGenerator.generate(); break;
            case 'grass': canvas = GrassGenerator.generate(); break;
            case 'stone': canvas = StoneGenerator.generate(); break;
            case 'basic': canvas = BasicPlane.generate(); break;
            default: canvas = BasicPlane.generate(); break; 
        }

        const blob = await canvas.convertToBlob({ type: 'image/png' });
        const url = URL.createObjectURL(blob);
        
        this.cache.set(type, url);
        return url;
    }
}
