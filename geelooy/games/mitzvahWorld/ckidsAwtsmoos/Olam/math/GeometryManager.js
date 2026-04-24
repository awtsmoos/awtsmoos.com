
/**
 * B"H
 * @module GeometryManager
 * @description
 * The grand registry of Divine Forms. 
 * Now fortified with immense try...catch protection.
 */

import HouseAssembler from "../../utils/3d/procedural/house/HouseAssembler.js";
import GrassPatchAssembler from "../../utils/3d/procedural/nature/GrassPatchAssembler.js";
// Keeping simple ones inline or importing as needed, but focusing on the requested intense generators here.

const registry = new Map();

export default class GeometryManager {
    static init() {
        if (this._initialized) return;
        
        try {
            this.register("HouseGeometry", HouseAssembler.generate);
            this.register("GrassPatchGeometry", GrassPatchAssembler.generate);
            console.log("B\"H - ⚡ GeometryManager Registry Initialized with House and Grass.");
        } catch(e) {
            console.error("B\"H - ⚡ GeometryManager Init Failed:", e);
        }

        this._initialized = true;
    }

    static register(typeName, generatorFn) {
        if (registry.has(typeName)) {
            console.warn(`B"H: Geometry type '${typeName}' is being overwritten.`);
        }
        registry.set(typeName, generatorFn);
    }

    static has(typeName) {
        this.init();
        return registry.has(typeName);
    }

    static create(typeName, args) {
        this.init();
        try {
            const generator = registry.get(typeName);
            if (!generator) {
                console.error(`B"H: Geometry type '${typeName}' not found in registry.`);
                return null;
            }
            return generator(...args);
        } catch (e) {
            console.error(`B"H - ⚡ Critical failure creating geometry ${typeName}:`, e);
            return null;
        }
    }
}
