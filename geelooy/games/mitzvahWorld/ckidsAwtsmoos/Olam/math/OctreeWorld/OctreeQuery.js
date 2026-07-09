
/**
 * @file OctreeQuery.js
 * @description
 * 🔍 CHAPTER 20: THE SEARCH FOR CONTACT 🔍
 * 
 * Refined the ray and capsule probing to ensure it traverses all 
 * branches of the LOD tree simultaneously, picking the highest-truth contact point.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class OctreeQuery {
    constructor(world) {
        this.world = world;
        this._box = new THREE.Box3();
    }

    rayIntersect(ray) {
        let best = null;
        const scan = (node) => {
            if (!ray.intersectsBox(node.box)) return;

            if (node.type === 'LEAF') {
                if (node.physics) {
                    const hit = node.physics.rayIntersect(ray);
                    if (hit && (!best || hit.distance < best.distance)) {
                        best = hit;
                    }
                }
            } else {
                node.children.forEach(scan);
            }
        };

        if (this.world.root) scan(this.world.root);
        
        // Also check unbaked temporary octrees (Satellites)
        this.world.pendingOctrees.forEach(sat => {
             const hit = sat.rayIntersect(ray);
             if (hit && (!best || hit.distance < best.distance)) best = hit;
        });

        return best;
    }

    capsuleIntersect(cap) {
        let hasHit = false;
        const test = cap.clone();
        
        // Establish the capsule's boundary box for culling
        this._box.setFromPoints([test.start, test.end]).expandByScalar(test.radius);

        const scan = (node) => {
            if (!this._box.intersectsBox(node.box)) return;

            if (node.type === 'LEAF') {
                if (node.physics) {
                    const res = node.physics.capsuleIntersect(test);
                    if (res) {
                        test.translate(res.normal.multiplyScalar(res.depth));
                        hasHit = true;
                    }
                }
            } else {
                node.children.forEach(scan);
            }
        };

        if (this.world.root) scan(this.world.root);

        if (hasHit) {
            const v = test.getCenter(new THREE.Vector3()).sub(cap.getCenter(new THREE.Vector3()));
            if (v.lengthSq() > 1e-12) return { normal: v.normalize(), depth: v.length() };
        }
        return false;
    }
}
