
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

const _tempBox = new THREE.Box3();

export default {
    rayIntersect(ray) {
        let closestResult = false;
        
        const check = (octree) => {
            const res = octree.rayIntersect(ray);
            if (res && (!closestResult || res.distance < closestResult.distance)) {
                closestResult = res;
            }
        };

        if (this._root) {
            const candidates = this._findLeafNodesInBox(this._root, this._root.box);
            for (const node of candidates) {
                if (node.physics) check(node.physics);
            }
        }

        for (const sat of this._pendingOctrees) {
            if (ray.intersectsBox(sat.box)) {
                check(sat);
            }
        }

        return closestResult;
    },
    
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

        if (this._root) {
            const candidates = this._findLeafNodesInBox(this._root, capsuleBox);
            for (const node of candidates) {
                if (node.physics) checkOctree(node.physics);
            }
        }

        for (const sat of this._pendingOctrees) {
            if (sat.box.intersectsBox(capsuleBox)) {
                checkOctree(sat);
            }
        }
        
        if (hit) {
            const correction = testCapsule.getCenter(new THREE.Vector3()).sub(capsule.getCenter(new THREE.Vector3()));
            const depth = correction.length();
            if (depth > 1e-9) return { normal: correction.normalize(), depth };
        }
        return false;
    },

    _findLeafNodesInBox(startNode, box, result = []) {
        if (!startNode.box.intersectsBox(box)) return result;
        if (startNode.type === 'LEAF') {
            result.push(startNode);
        } else if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                this._findLeafNodesInBox(child, box, result);
            }
        }
        return result;
    },
    
    _findLeafNodeAtPoint(startNode, point) {
        if (!startNode.box.containsPoint(point)) return null;
        if (startNode.type === 'LEAF') return startNode;
        if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                const result = this._findLeafNodeAtPoint(child, point);
                if (result) return result;
            }
        }
        return null;
    },

    _getNodeDepth(nodeToFind, startNode = this._root, depth = 0) {
        if (nodeToFind === startNode) return depth;
        if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                if (child.box.containsBox(nodeToFind.box) || child.box.intersectsBox(nodeToFind.box)) {
                    const foundDepth = this._getNodeDepth(nodeToFind, child, depth + 1);
                    if (foundDepth !== -1) return foundDepth;
                }
            }
        }
        return -1;
    }
};
