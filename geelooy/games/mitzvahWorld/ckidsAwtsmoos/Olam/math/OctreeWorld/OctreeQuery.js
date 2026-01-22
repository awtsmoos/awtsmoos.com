// B"H
import * as THREE from '/games/scripts/build/three.module.js';

/**
 * OctreeQuery - Efficiently probing the physical laws of the Olam.
 * Refined to traverse the LOD tree recursively for logarithmic performance.
 */
export default class OctreeQuery {
    constructor(world) {
        this.world = world;
        this._tempBox = new THREE.Box3();
    }

    /**
     * Probes for intersections along a ray.
     * Recursively traverses only the branches the ray actually visits.
     */
    rayIntersect(ray) {
        let closestResult = false;
        
        const traverseNode = (node) => {
            // 1. Boundary Guard: If the ray doesn't hit this branch's box, ignore its entire progeny.
            if (!ray.intersectsBox(node.box)) return;

            if (node.type === 'LEAF') {
                // 2. Leaf Manifestation: Probing the actual geometry within this sacred space.
                if (node.physics) {
                    const res = node.physics.rayIntersect(ray);
                    if (res && (!closestResult || res.distance < closestResult.distance)) {
                        closestResult = res;
                    }
                }
            } else {
                // 3. Branching: Delving deeper into the sub-divisions of existence.
                for (let i = 0; i < node.children.length; i++) {
                    traverseNode(node.children[i]);
                }
            }
        };

        if (this.world.root) {
            traverseNode(this.world.root);
        }

        // 4. Satellite Check: Temporary octrees for instant interaction.
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
     * Resolves collisions between a Capsule and the world.
     */
    capsuleIntersect(capsule) {
        let hit = false;
        const testCapsule = capsule.clone();

        // Establish the search bounds for this physical probe
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
