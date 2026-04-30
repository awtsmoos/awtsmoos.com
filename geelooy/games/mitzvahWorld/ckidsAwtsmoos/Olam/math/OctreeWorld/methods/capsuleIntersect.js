
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
const _tempBox = new THREE.Box3();

export default {
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

        const capsuleBox = _tempBox;
        capsuleBox.min.copy(testCapsule.start).min(testCapsule.end).subScalar(testCapsule.radius);
        capsuleBox.max.copy(testCapsule.start).max(testCapsule.end).addScalar(testCapsule.radius);

        if (this.root) {
            const candidates = this._findLeafNodesInBox(this.root, capsuleBox);
            for (const node of candidates) {
                if (node.physics) checkOctree(node.physics);
            }
        }

        // B"H: The rapid un-baked satellite awareness
        for (const sat of this._pendingOctrees) {
            if (sat.box.intersectsBox(capsuleBox)) checkOctree(sat);
        }
        
        if (hit) {
            const correction = testCapsule.getCenter(new THREE.Vector3()).sub(capsule.getCenter(new THREE.Vector3()));
            const depth = correction.length();
            if (depth > 1e-9) return { normal: correction.normalize(), depth };
        }
        return false;
    }
};
