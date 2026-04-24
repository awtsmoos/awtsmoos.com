
/**
 * B"H
 * @module GeometryManager
 * @description
 * The grand registry of Divine Forms. 
 * It holds the mathematical blueprints necessary to summon complex shapes from the void.
 * This vessel employs lazy initialization to avoid the paradox of the serpent eating its own tail 
 * (circular dependencies), ensuring the Olam loads with pristine clarity.
 */

import Pillar from "../../utils/3d/procedural/Pillar.js";
import Arch from "../../utils/3d/procedural/Arch.js";
import Dome from "../../utils/3d/procedural/Dome.js";
import House from "../../utils/3d/procedural/House.js";

const registry = new Map();

export default class GeometryManager {
    /**
     * @function init
     * @description Populates the registry with the fundamental archetypes of architecture.
     * Fired only once, precisely when needed.
     */
    static init() {
        if (this._initialized) return;
        
        this.register("PillarGeometry", Pillar.generate);
        this.register("ArchGeometry", Arch.generate);
        this.register("DomeGeometry", Dome.generate);
        this.register("HouseGeometry", House.generate);
        
        this._initialized = true;
        console.log("B\"H: GeometryManager Registry Initialized.");
    }

    /**
     * @function register
     * @description Inscribes a new geometric law into the ledger.
     * @param {string} typeName - The Name of the form (e.g., "StairGeometry").
     * @param {Function} generatorFn - The function that returns the physical THREE.BufferGeometry.
     */
    static register(typeName, generatorFn) {
        if (registry.has(typeName)) {
            console.warn(`B"H: Geometry type '${typeName}' is being overwritten.`);
        }
        registry.set(typeName, generatorFn);
    }

    /**
     * @function has
     * @description Checks if the requested form exists within the registry.
     * @param {string} typeName 
     * @returns {boolean}
     */
    static has(typeName) {
        this.init();
        return registry.has(typeName);
    }

    /**
     * @function create
     * @description Summons the geometry from its mathematical slumber into the physical realm.
     * @param {string} typeName - The name of the shape.
     * @param {Array} args - The dimensions and decrees passed to the generator.
     * @returns {THREE.BufferGeometry|null}
     */
    static create(typeName, args) {
        this.init();
        const generator = registry.get(typeName);
        if (!generator) {
            console.error(`B"H: Geometry type '${typeName}' not found in registry.`);
            return null;
        }
        // Destructure the arguments array into the generator function
        return generator(...args);
    }
}
