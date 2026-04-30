
/**
 * B"H
 * @module DoorGeometry
 * @description
 * "Knock, and it shall be opened unto you."
 * Forges an elegant door, complete with a gleaming knob.
 * Crucially, it translates its geometry so the pivot point (origin) rests precisely 
 * on the hinge edge, allowing natural, swinging rotation in the physical engine.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';

export default class DoorGeometry {
    /**
     * @function generate
     * @param {number} width - Span of the opening
     * @param {number} height - Elevation of the doorway
     * @param {number} thickness - Physical depth of the wood
     */
    static generate(width = 4, height = 5.5, thickness = 0.5) {
        try {
            // 1. The Main Slab (Wood)
            const slab = new THREE.BoxGeometry(width, height, thickness);
            const slabCount = slab.index ? slab.index.count : slab.attributes.position.count;
            slab.clearGroups(); 
            slab.addGroup(0, slabCount, 0); // Material Group 0

            // 2. The Doorknob (Gold/Metal)
            const knobRadius = 0.25;
            const knob = new THREE.SphereGeometry(knobRadius, 16, 16);
            
            // Position the knob near the right edge (since hinge will be on the left)
            // Center is 0,0. Left edge is -width/2. Right edge is +width/2.
            const knobX = (width / 2) - 0.6;
            // Slightly below center height
            const knobY = -height * 0.1;
            // Stick out past the thickness
            const knobZ = (thickness / 2) + (knobRadius / 2);
            
            knob.translate(knobX, knobY, knobZ);
            
            const knobCount = knob.index ? knob.index.count : knob.attributes.position.count;
            knob.clearGroups(); 
            knob.addGroup(0, knobCount, 1); // Material Group 1

            // 3. Unification
            const merged = BufferGeometryUtils.mergeGeometries([slab, knob], true);
            
            // 4. Hinge Alignment
            // Translate the entire geometry so its local origin (0,0,0) is at the left edge (the hinge)
            // and at the bottom.
            merged.translate(width / 2, height / 2, 0);
            
            merged.computeBoundingBox();
            merged.computeVertexNormals();
            
            return merged;
        } catch (e) {
            console.error("B\"H - ⚡ Door Forge failed. Returning basic slab.", e);
            const fallback = new THREE.BoxGeometry(width, height, thickness);
            fallback.translate(width / 2, height / 2, 0);
            return fallback;
        }
    }
}
