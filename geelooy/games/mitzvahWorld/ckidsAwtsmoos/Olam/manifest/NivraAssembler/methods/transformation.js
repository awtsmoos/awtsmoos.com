// B"H
/**
 * @file transformation.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE ALIGNMENT OF THE SPHERES — Spatial Transformation                   ║
 * ║                                                                          ║
 * ║  "And the wheels were full of eyes..." (Yechezkel 1:18)                  ║
 * ║                                                                          ║
 * ║  Ensures that child emanations are correctly rotated and positioned      ║
 * ║  relative to their parent vessels in the Seder Hishtalshelus.           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    /**
     * @method applyParentTransform
     * @description
     * Adjusts a child's local coordinates based on the parent's world state.
     * 
     * @param {THREE.Vector3} childPos - The raw local position.
     * @param {Object} parent - The parent entity with position/rotation.
     */
    applyParentTransform(childPos, parent) {
        if (!parent) return;

        // Apply Rotation
        if (parent.rotation) {
            const euler = new THREE.Euler(
                parent.rotation.x || 0,
                parent.rotation.y || 0,
                parent.rotation.z || 0
            );
            childPos.applyEuler(euler);
        }

        // Apply Position
        const p = parent.position?.vector3 ? parent.position.vector3() : parent.position;
        if (p) {
            childPos.x += (p.x || 0);
            childPos.y += (p.y || 0);
            childPos.z += (p.z || 0);
        }
    },

    /**
     * @method resolveRotation
     * @description Combines local and parent rotations.
     */
    resolveRotation(rotNode, parent) {
        const localX = this.evaluate(rotNode?.x || 0);
        const localY = this.evaluate(rotNode?.y || 0);
        const localZ = this.evaluate(rotNode?.z || 0);

        if (!parent || !parent.rotation) {
            return { x: localX, y: localY, z: localZ };
        }

        return {
            x: localX + (parent.rotation.x || 0),
            y: localY + (parent.rotation.y || 0),
            z: localZ + (parent.rotation.z || 0)
        };
    }
};
