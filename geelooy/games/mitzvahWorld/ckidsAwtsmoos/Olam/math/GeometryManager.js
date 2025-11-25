/**
 * B"H
 * GeometryManager.js
 * A registry for custom procedural geometries.
 * Allows any class to register a geometry generator that can be saved/loaded via JSON.
 */

const registry = new Map();

export default class GeometryManager {
    /**
     * Registers a new custom geometry type.
     * @param {string} typeName - The name used in the 'golem' definition (e.g., "StairGeometry").
     * @param {Function} generatorFn - A function that returns a THREE.BufferGeometry. Receives args from the golem array.
     */
    static register(typeName, generatorFn) {
        if (registry.has(typeName)) {
            console.warn(`B"H: Geometry type '${typeName}' is being overwritten.`);
        }
        registry.set(typeName, generatorFn);
    }

    /**
     * Checks if a geometry type exists.
     * @param {string} typeName 
     */
    static has(typeName) {
        return registry.has(typeName);
    }

    /**
     * Generates the geometry.
     * @param {string} typeName 
     * @param {Array} args - Arguments passed from the golem definition.
     */
    static create(typeName, args) {
        const generator = registry.get(typeName);
        if (!generator) {
            console.error(`B"H: Geometry type '${typeName}' not found in registry.`);
            return null;
        }
        return generator(...args);
    }
}