
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

export default class OctreeQuery {
    constructor(world) {
        this.world = world;
        this._tempBox = new THREE.Box3();
    }

    rayIntersect(ray) {
        let closestResult = false;
        
        const check = (octree) => {
            const res = octree.rayIntersect(ray);
            if (res && (!closestResult || res.distance < closestResult.distance)) {
                closestResult = res;
            }
        };

        if (this.world.root) {
            const candidates = this.world.intake.findLeafNodesInBox(this.world.root, this.world.root.box);
            for (const node of candidates) {
                if (node.physics) check(node.physics);
            }
        }

        for (const sat of this.world.pendingOctrees) {
            if (ray.intersectsBox(sat.box)) {
                check(sat);
            }
        }

        return closestResult;
    }

    capsuleIntersect(capsule) {
        let hit = false;
        const testCapsule = capsule.clone();
        
        const checkOctree = (octree) => {
             const result = octree.capsuleIntersect(testCapsule);
             if (result) {
                 testCapsule.translate(result.normal.multiplyScalar(result.depth));
                 hit = true;
             }
        };

        this._tempBox.min.copy(testCapsule.start).min(testCapsule.end).subScalar(testCapsule.radius);
        this._tempBox.max.copy(testCapsule.start).max(testCapsule.end).addScalar(testCapsule.radius);

        if (this.world.root) {
            const candidates = this.world.intake.findLeafNodesInBox(this.world.root, this._tempBox);
            for (const node of candidates) {
                if (node.physics) checkOctree(node.physics);
            }
        }

        for (const sat of this.world.pendingOctrees) {
            if (sat.box.intersectsBox(this._tempBox)) {
                checkOctree(sat);
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
