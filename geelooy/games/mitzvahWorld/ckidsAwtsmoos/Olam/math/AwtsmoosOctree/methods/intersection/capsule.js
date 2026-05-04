
// B"H
/**
 * @module CapsuleIntersect
 * @description
 * 🛡️ THE SHIELD OF AWARENESS 🛡️
 * 
 * "And I will walk among you..."
 * As a soul moves through the world, its physical manifestation is bounded by a Capsule.
 * This file contains the logic that allows that Capsule to slide off walls, climb stairs,
 * and prevent itself from passing through the solid truth of the terrain.
 * 
 * It queries both the static stones and the moving entities, instantly ignoring
 * the ghosts of objects that have been deleted from existence.
 */
import * as THREE from '/games/scripts/build/three.module.js';
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _temp_triangle = new THREE.Triangle();

export default {
    /**
     * @method capsuleIntersect
     * @description Collides a capsule against the entire octree.
     * @param {THREE.Capsule} capsule 
     * @returns {Object|boolean} Normal and depth of collision, or false.
     */
    capsuleIntersect(capsule) {
        if (!this.isBuilt) this.build();
        if (this.box.isEmpty() || !capsule.intersectsBox(this.box)) return false;

        const resultCapsule = capsule.clone();
        let hit = false;
        
        // B"H: USE A Set FOR O(1) DEDUPLICATION
        // The previous Array + indexOf was O(n^2) — the root of the memory freeze.
        // A Set guarantees each triangle index is tested exactly once, O(1) per add.
        const triangleIndexSet = new Set();
        this.getCapsuleTriangles(capsule, triangleIndexSet);
        
        // 1. Static Entities
        for (const index of triangleIndexSet) {
            // --- B"H FIX: IGNORE DELETED GHOSTS ---
            const source = this.allTriangles[index] ? this.allTriangles[index].sourceMesh : null;
            let isDead = false;
            if (source) {
                const vis = source.userData?.visualReference || source;
                if (!vis.parent) isDead = true;
            }
            if (isDead) continue;
            // -------------------------------

            const tri = this._getTriangle(index, _temp_triangle);
            const result = this._triangleCapsuleIntersect(resultCapsule, tri);
            if (result) {
                hit = true;
                resultCapsule.translate(result.normal.multiplyScalar(result.depth));
            }
        }

        // 2. Dynamic, Living Entities
        const dynamicTris = [];
        this._getDynamicCapsuleTriangles(capsule, dynamicTris);
        for (const tri of dynamicTris) {
            // --- B"H FIX: IGNORE DELETED GHOSTS ---
            let isDead = false;
            if (tri.sourceMesh) {
                const vis = tri.sourceMesh.userData?.visualReference || tri.sourceMesh;
                if (!vis.parent) isDead = true;
            }
            if (isDead) continue;
            // -------------------------------

            const result = this._triangleCapsuleIntersect(resultCapsule, tri);
            if (result) {
                hit = true;
                resultCapsule.translate(result.normal.multiplyScalar(result.depth));
            }
        }

        // Resolve Final Push
        if (hit) {
            const collisionVector = resultCapsule.getCenter(_v1).sub(capsule.getCenter(_v2));
            if (collisionVector.lengthSq() > 1e-10) {
                const depth = collisionVector.length();
                return { normal: collisionVector.normalize(), depth: depth };
            }
        }
        return false;
    }
};
