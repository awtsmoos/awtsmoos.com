
// B"H
/**
 * @module RayIntersect
 * @description
 * 🔦 THE PIERCING GAZE OF INTENT 🔦
 * 
 * "The eyes of the Lord roam back and forth over the whole earth."
 * 
 * THE TIKKUN OF VISION:
 * Just like the capsule check, we have removed the horrific `isDead` traversal.
 * The ray now passes through the mathematical grid without getting tangled 
 * in the branches of the scene graph, ensuring your cursor never lags again.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

const _v1 = new THREE.Vector3();
const _triangle = new THREE.Triangle();

export default {
    /**
     * @method rayIntersect
     * @description Fires a mathematical beam to detect objects.
     * @param {THREE.Ray} ray - The beam of light.
     * @returns {Object|null} The closest intersected object data.
     */
    rayIntersect(ray) {
        if (!this.isBuilt) this.build();
        if (this.box.isEmpty() || !ray.intersectsBox(this.box)) return null;

        let closest = null;
        
        const trianglesToCheck = { staticIndices: new Set(), dynamicTris: new Set() };
        this._getHybridRayTriangles(ray, trianglesToCheck);

        // Scan the eternal static stones of the world
        for (const index of trianglesToCheck.staticIndices) {
            const triangle = this._getTriangle(index, _triangle);
            
            const hit = ray.intersectTriangle(triangle.a, triangle.b, triangle.c, false, _v1);
            if (hit) {
                const distSq = ray.origin.distanceToSquared(hit);
                if (!closest || distSq < closest.distance * closest.distance) {
                    const n = new THREE.Vector3();
                    triangle.getNormal(n);
                    
                    const source = this.allTriangles[index] ? this.allTriangles[index].sourceMesh : null;
                    closest = {
                        distance: Math.sqrt(distSq),
                        position: hit.clone(),
                        normal: n,
                        object: source,
                        nivraAwtsmoos: source ? source.nivraAwtsmoos : null
                    };
                }
            }
        }
        
        // Scan the shifting, dynamic entities
        for (const triangle of trianglesToCheck.dynamicTris) {
            const hit = ray.intersectTriangle(triangle.a, triangle.b, triangle.c, false, _v1);
            if (hit) {
                const distSq = ray.origin.distanceToSquared(hit);
                if (!closest || distSq < closest.distance * closest.distance) {
                    const n = new THREE.Vector3();
                    triangle.getNormal(n);
                    closest = {
                        distance: Math.sqrt(distSq),
                        position: hit.clone(),
                        normal: n,
                        object: triangle.sourceMesh,
                        nivraAwtsmoos: triangle.sourceMesh ? triangle.sourceMesh.nivraAwtsmoos : null
                    };
                }
            }
        }

        return closest;
    },

    /**
     * @method _getTrianglesInBox
     * @description Gathers triangles falling within a specific cube of space.
     * @param {THREE.Box3} box 
     * @param {Array} result 
     */
    _getTrianglesInBox(box, result) {
        this.subTrees.forEach(st => {
            if (st.box.intersectsBox(box)) st._getTrianglesInBox(box, result);
        });
        this.triangles.forEach(t => { if(!result.includes(t)) result.push(t); });
    }
};
