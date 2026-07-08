
/**
 * B"H
 * @module GeometryManifestor
 * @description
 * 📐 CHAPTER 18: THE CARVING OF THE VESSELS 📐
 * 
 * "He measured the heavens with a span and calculated the dust of the earth."
 * 
 * Every object in the Olam must first possess a definitive form, a mathematical 
 * boundary that separates it from the Infinite Light. This module takes the 
 * "Guf" instructions from the Golem blueprint and manifest Three.js BufferGeometry.
 * 
 * TIKKUN:
 * We add extreme verification logic to ensure the arguments passed to the 
 * geometry constructors (like BoxGeometry) are indeed present. If the ground
 * is missing, it is here that the lack of measurement would be revealed.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import GeometryManager from '../../math/GeometryManager.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class GeometryManifestor {
    /**
     * @function manifest
     * @description Translates JSON geometry definitions into physical Three.js BufferGeometry.
     * @param {Object} gufSchema - The 'guf' section of the golem.
     * @returns {THREE.BufferGeometry}
     */
    static manifest(gufSchema) {
        if (!gufSchema) {
            console.warn('B"H - ⚠️ Formless Guf detected. Defaulting to standard cubic vessel.');
            return new THREE.BoxGeometry(1, 1, 1);
        }

        const entries = Object.entries(gufSchema);
        if (entries.length === 0) return new THREE.BoxGeometry(1, 1, 1);

        const [typeName, args] = entries[0];
        
        // B"H: silent


        let geometry;
        try {
            // 1. SEEK THE DIVINE REGISTRY
            // GeometryManager holds our custom procedural algorithms
            if (GeometryManager.has(typeName)) {
                geometry = GeometryManager.create(typeName, args);
            } 
            // 2. SEEK THE STANDARD DIMENSIONS
            else if (THREE[typeName]) {
                // We ensure 'args' is an array so the spread operator spreads light correctly.
                const validArgs = Array.isArray(args) ? args : [args];
                
                // EXTREME MEASUREMENT LOGGING
                if (typeName.includes("Box") || typeName.includes("Plane")) {
                    // B"H: silent

                }
                
                geometry = new THREE[typeName](...validArgs);
            } 
            // 3. FALLBACK TO STABILITY
            else {
                console.warn(`B"H - ⚠️ Archetype [${typeName}] not found. Creating fallback cube.`);
                geometry = new THREE.BoxGeometry(1, 1, 1);
            }

            // REVEALING THE TRUTH OF BOUNDS
            if (geometry) {
                geometry.computeBoundingBox();
                const box = geometry.boundingBox;
                // B"H: silent

            }

            return geometry;
        } catch (e) {
            console.error(`B"H - 🚨 THE GEOMETRY FORGE SHATTERED during [${typeName}]:`, e);
            return new THREE.BoxGeometry(1, 1, 1);
        }
    }
}
