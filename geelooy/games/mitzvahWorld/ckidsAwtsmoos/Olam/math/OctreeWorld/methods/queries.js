
// B"H
/**
 * @module OctreeWorld_Queries
 * @description
 * 🖐️ THE SENSE OF TOUCH 🖐️
 * 
 * Chapter 9: The Verification of Solids.
 * This module allows external systems to probe the world. Raycasting to 
 * find what the eye sees, and Capsule checks to find what the body touches.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
const _tempBox = new THREE.Box3();

export default {
    /**
     * @method rayIntersect
     * @description Fires a beam of light to detect what exists.
     */
    rayIntersect(ray) {
        let best = false;
        const check = (node) => {
            if (!ray.intersectsBox(node.box)) return;
            if (node.type === 'LEAF') {
                if (node.physics) {
                    const hit = node.physics.rayIntersect(ray);
                    if (hit && (!best || hit.distance < best.distance)) best = hit;
                }
            } else node.children.forEach(check);
        };
        if (this.root) check(this.root);
        this._pendingOctrees.forEach(sat => {
             const hit = sat.rayIntersect(ray);
             if (hit && (!best || hit.distance < best.distance)) best = hit;
        });
        return best;
    },

    /**
     * @method capsuleIntersect
     * @description Checks if a bodily vessel is colliding with reality.
     */
    capsuleIntersect(capsule) {
        let hit = false;
        const test = capsule.clone();
        
        // Bounds for initial pruning
        _tempBox.min.copy(test.start).min(test.end).subScalar(test.radius);
        _tempBox.max.copy(test.start).max(test.end).addScalar(test.radius);

        const checkNode = (node) => {
            if (!_tempBox.intersectsBox(node.box)) return;
            if (node.type === 'LEAF') {
                if (node.physics) {
                    const res = node.physics.capsuleIntersect(test);
                    if (res) { test.translate(res.normal.multiplyScalar(res.depth)); hit = true; }
                }
            } else node.children.forEach(checkNode);
        };

        if (this.root) checkNode(this.root);
        this._pendingOctrees.forEach(sat => {
             if (sat.box.intersectsBox(_tempBox)) {
                  const res = sat.capsuleIntersect(test);
                  if (res) { test.translate(res.normal.multiplyScalar(res.depth)); hit = true; }
             }
        });
        
        if (hit) {
            const v = test.getCenter(new THREE.Vector3()).sub(capsule.getCenter(new THREE.Vector3()));
            if (v.lengthSq() > 1e-9) return { normal: v.normalize(), depth: v.length() };
        }
        return false;
    }
};
