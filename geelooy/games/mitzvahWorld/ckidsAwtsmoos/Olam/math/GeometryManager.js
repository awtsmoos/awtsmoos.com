
/**
 * B"H
 * @module GeometryManager
 * @description
 * The grand registry of Divine Forms. 
 * "He forms light and creates darkness, He makes peace and creates all things." (Yeshayahu 45:7)
 * 
 * This registry holds the mathematical blueprints for all procedural vessels,
 * ensuring they can be instantiated instantly without external file loads.
 */

import HouseAssembler from "../../utils/3d/procedural/house/HouseAssembler.js";
import GrassPatchAssembler from "../../utils/3d/procedural/nature/GrassPatchAssembler.js";
import RockAssembler from "../../utils/3d/procedural/nature/RockAssembler.js";
import CloudAssembler from "../../utils/3d/procedural/nature/CloudAssembler.js";
import StoneWell from "../methods/procedural/Structures/StoneWell.js"; 
import DoorGeometry from "../../utils/3d/procedural/Door.js";
import LampPost from "../../utils/3d/procedural/Structures/LampPost.js"; 

// B"H: Summoning the intense procedural forms!
import Dome from "../../utils/3d/procedural/Dome.js";
import Island from "../../utils/3d/procedural/Island.js";
import Labyrinth from "../../utils/3d/procedural/Labyrinth.js";
import Pyramid from "../../utils/3d/procedural/Pyramid.js";
import Arch from "../../utils/3d/procedural/Arch.js";
import Pillar from "../../utils/3d/procedural/Pillar.js";
import Wall from "../../utils/3d/procedural/Wall.js";

const registry = new Map();

export default class GeometryManager {
    static init() {
        if (this._initialized) return;
        
        try {
            // B"H: ABSOLUTE SAFEGUARD - Wrap in arrow functions to freeze context
            this.register("HouseGeometry", (...args) => HouseAssembler.generate(...args));
            this.register("GrassPatchGeometry", (...args) => GrassPatchAssembler.generate(...args));
            this.register("RockGeometry", (...args) => RockAssembler.generate(...args));
            this.register("CloudGeometry", (...args) => CloudAssembler.generate(...args));
            this.register("WellGeometry", (...args) => StoneWell.generate(...args)); 
            this.register("DoorGeometry", (...args) => DoorGeometry.generate(...args)); 
            this.register("LampPostGeometry", (...args) => LampPost.generate(...args));
            
            // B"H: Injecting the newly discovered geometries
            this.register("DomeGeometry", (...args) => Dome.generate(...args));
            this.register("IslandGeometry", (...args) => Island.generate(...args));
            this.register("LabyrinthGeometry", (...args) => Labyrinth.generate(...args));
            this.register("PyramidGeometry", (...args) => Pyramid.generate(...args));
            this.register("ArchGeometry", (...args) => Arch.generate(...args));
            this.register("PillarGeometry", (...args) => Pillar.generate(...args));
            this.register("WallGeometry", (...args) => Wall.generate(...args));
            
            // B"H: silent

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
