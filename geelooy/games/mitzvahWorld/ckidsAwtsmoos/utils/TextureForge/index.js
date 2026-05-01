
/**
 * B"H
 * @module TextureForge
 * @description
 * The ultimate Forge of Form. Intercepts requests for divine patterns 
 * (awtsmoosTex://...) and crystallizes them into physical data (Blob URLs).
 */

import BarkGenerator from "./Generators/Bark.js";
import LeafGenerator from "./Generators/Leaf.js";
import SandGenerator from "./Generators/Sand.js";
import GrassGenerator from "./Generators/Grass.js";
import StoneGenerator from "./Generators/Stone.js";
import BasicPlane from "./Generators/BasicPlane.js"; 
import SafeGrass from "./Generators/SafeGrass.js"; 
import Emerald from "./Generators/Emerald.js"; 
import BrickGenerator from "./Generators/Brick.js"; 
import WoodGenerator from "./Generators/Wood.js";
import CanvasHelper from "./CanvasHelper.js";

export default class TextureForge {
    static cache = new Map();

    static async generate(type) {
        if (this.cache.has(type)) {
            return this.cache.get(type);
        }

        let canvas;
        try {
            switch(type.toLowerCase()) {
                case 'bark': canvas = BarkGenerator.generate(); break;
                case 'leaf': canvas = LeafGenerator.generate(); break;
                case 'sand': canvas = SandGenerator.generate(); break;
                case 'grass': canvas = GrassGenerator.generate(); break;
                case 'stone': canvas = StoneGenerator.generate(); break;
                case 'basic': canvas = BasicPlane.generate(); break;
                case 'safegrass': canvas = SafeGrass.generate(); break; 
                case 'emerald': canvas = Emerald.generate(); break; 
                case 'brick': canvas = BrickGenerator.generate(); break; 
                case 'wood': canvas = WoodGenerator.generate(); break;
                default: canvas = SafeGrass.generate(); break; 
            }

            const blob = await CanvasHelper.toBlob(canvas);
            const url = URL.createObjectURL(blob);
            
            this.cache.set(type, url);
            return url;
        } catch (e) {
            console.error("B\"H - ⚡ TextureForge failed to crystallize:", type, e);
            const emBlob = new Blob([''], {type: 'image/png'});
            return URL.createObjectURL(emBlob);
        }
    }
}
