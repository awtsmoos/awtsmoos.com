
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
const _tempBox = new THREE.Box3();

export default {
    capsuleIntersect(capsule) {
        // B"H: Find the deepest single collision result.
        // We do NOT accumulate corrections here — that corrupts the normal.
        // Instead return the single strongest hit so the caller can act on a
        // real surface normal (used to determine onFloor, slide along walls, etc.)
        let bestResult = null;

        const capsuleBox = _tempBox;
        capsuleBox.min.copy(capsule.start).min(capsule.end).subScalar(capsule.radius);
        capsuleBox.max.copy(capsule.start).max(capsule.end).addScalar(capsule.radius);

        const checkOctree = (octree) => {
            const result = octree.capsuleIntersect(capsule);
            if (result) {
                if (!bestResult || result.depth > bestResult.depth) {
                    bestResult = result;
                }
            }
        };

        if (this.root) {
            const candidates = this._findLeafNodesInBox(this.root, capsuleBox);
            for (const node of candidates) {
                if (node.physics) checkOctree(node.physics);
            }
        }

        for (const sat of this._pendingOctrees) {
            if (sat.box.intersectsBox(capsuleBox)) checkOctree(sat);
        }

        return bestResult || false;
    }
};
