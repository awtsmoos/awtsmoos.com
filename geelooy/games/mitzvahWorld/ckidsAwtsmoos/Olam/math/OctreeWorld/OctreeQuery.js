// B"H
import * as THREE from '/games/scripts/build/three.module.js';

/**
 * OctreeQuery - Probing the physical laws of the Olam.
 * Uses recursive traversal to ensure O(log N) query times.
 */
export default class OctreeQuery {
    constructor(world) {
        this.world = world;
        this._tempBox = new THREE.Box3();
    }

    /**
     * rayIntersect - Finds the closest point of contact for a ray.
     */
    rayIntersect(ray) {
        let closestResult = false;
        
        const traverseNode = (node) => {
            // 1. Boundary Guard: If the ray doesn't hit this branch, ignore its progeny.
            if (!ray.intersectsBox(node.box)) return;

            if (node.type === 'LEAF') {
                if (node.physics) {
                    const res = node.physics.rayIntersect(ray);
                    if (res && (!closestResult || res.distance < closestResult.distance)) {
                        closestResult = res;
                    }
                }
            } else {
                for (let i = 0; i < node.children.length; i++) {
                    traverseNode(node.children[i]);
                }
            }
        };

        if (this.world.root) {
            traverseNode(this.world.root);
        }

        // Check satellites (instant loading objects)
        for (const sat of this.world.pendingOctrees) {
            if (ray.intersectsBox(sat.box)) {
                const res = sat.rayIntersect(ray);
                if (res && (!closestResult || res.distance < closestResult.distance)) {
                    closestResult = res;
                }
            }
        }

        return closestResult;
    }

    /**
     * capsuleIntersect - Resolves collision for a capsule vessel.
     */
    capsuleIntersect(capsule) {
        let hit = false;
        const testCapsule = capsule.clone();

        this._tempBox.min.copy(testCapsule.start).min(testCapsule.end).subScalar(testCapsule.radius);
        this._tempBox.max.copy(testCapsule.start).max(testCapsule.end).addScalar(testCapsule.radius);

        const traverseNode = (node) => {
            if (!this._tempBox.intersectsBox(node.box)) return;

            if (node.type === 'LEAF') {
                if (node.physics) {
                    const result = node.physics.capsuleIntersect(testCapsule);
                    if (result) {
                        testCapsule.translate(result.normal.multiplyScalar(result.depth));
                        hit = true;
                    }
                }
            } else {
                for (let i = 0; i < node.children.length; i++) {
                    traverseNode(node.children[i]);
                }
            }
        };

        if (this.world.root) {
            traverseNode(this.world.root);
        }

        for (const sat of this.world.pendingOctrees) {
            if (sat.box.intersectsBox(this._tempBox)) {
                 const result = sat.capsuleIntersect(testCapsule);
                 if (result) {
                     testCapsule.translate(result.normal.multiplyScalar(result.depth));
                     hit = true;
                 }
            }
        }
        
        if (hit) {
            const correction = testCapsule.getCenter(new THREE.Vector3()).sub(capsule.getCenter(new THREE.Vector3()));
            const depth = correction.length();
            if (depth > 1e-9) return { normal: correction.normalize(), depth };
        }
        return false;
    }
}
