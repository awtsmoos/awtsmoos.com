
/**
 * B"H
 * @module GeometryManager
 * @description
 * The grand registry of Divine Forms. 
 */

import HouseAssembler from "../../utils/3d/procedural/house/HouseAssembler.js";
import GrassPatchAssembler from "../../utils/3d/procedural/nature/GrassPatchAssembler.js";
import RockAssembler from "../../utils/3d/procedural/nature/RockAssembler.js";
import CloudAssembler from "../../utils/3d/procedural/nature/CloudAssembler.js";

const registry = new Map();

export default class GeometryManager {
    static init() {
        if (this._initialized) return;
        
        try {
            this.register("HouseGeometry", HouseAssembler.generate);
            this.register("GrassPatchGeometry", GrassPatchAssembler.generate);
            this.register("RockGeometry", RockAssembler.generate);
            this.register("CloudGeometry", CloudAssembler.generate);
            console.log("B\"H - ⚡ GeometryManager Registry Initialized with expanded nature forms.");
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
            console.error(`B"H - ⚡ Critical failure creating geometry \${typeName}:`, e);
            return null;
        }
    }
}
