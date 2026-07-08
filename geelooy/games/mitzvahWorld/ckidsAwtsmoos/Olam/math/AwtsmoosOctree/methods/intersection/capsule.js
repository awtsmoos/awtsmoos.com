
// B"H
/**
 * @module CapsuleIntersect
 * @description
 * 🛡️ THE SHIELD OF AWARENESS 🛡️
 * 
 * "And I will walk among you..."
 * 
 * THE TIKKUN OF PERFORMANCE:
 * We have utterly stripped the `visualReference.parent` checks from this inner loop.
 * Leaving the mathematical realm to query the DOM/THREE.js hierarchy for EVERY 
 * triangle was causing absolute CPU asphyxiation. We now trust the Awtsmoos 
 * to handle destruction asynchronously via `removeMesh` and `pruneDeadTriangles`.
 * The result? Pure, unadulterated lightning speed!
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
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
        
        // B"H: O(1) Deduplication Set!
        const triangleIndexSet = new Set();
        this.getCapsuleTriangles(capsule, triangleIndexSet);
        
        // 1. Static Entities
        for (const index of triangleIndexSet) {
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
