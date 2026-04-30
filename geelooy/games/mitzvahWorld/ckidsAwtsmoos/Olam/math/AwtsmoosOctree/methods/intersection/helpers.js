
// B"H
/**
 * @module IntersectionHelpers
 * @description
 * 🧭 THE GUIDES OF THE LABYRINTH 🧭
 * 
 * As we plunge through the complex branches of the Octree, we need tools 
 * to fetch the triangles residing within specific boxes of reality. 
 * This file contains the sacred fetching mechanisms, collecting the 
 * indices of triangles that exist within the path of a ray or capsule.
 */
export default {
    /**
     * @method getCapsuleTriangles
     * @description Gathers all static triangle indices within the capsule's reach.
     * @param {THREE.Capsule} capsule 
     * @param {Array<number>} triangles 
     */
    getCapsuleTriangles(capsule, triangles) {
        for (const subTree of this.subTrees) {
            if (capsule.intersectsBox(subTree.box)) {
                subTree.getCapsuleTriangles(capsule, triangles);
            }
        }
        for (const index of this.triangles) {
            if (triangles.indexOf(index) === -1) {
                triangles.push(index);
            }
        }
    },
    
    /**
     * @method getRayTriangles
     * @description Gathers all static triangle indices within the ray's bounds.
     * @param {THREE.Ray} ray 
     * @param {Array<number>} triangles 
     */
    getRayTriangles(ray, triangles) {
        for (const subTree of this.subTrees) {
            if (ray.intersectsBox(subTree.box)) {
                subTree.getRayTriangles(ray, triangles);
            }
        }
        for (const index of this.triangles) {
            if (triangles.indexOf(index) === -1) {
                triangles.push(index);
            }
        }
    },

    /**
     * @method _getDynamicCapsuleTriangles
     * @description Fetches all living, dynamic triangles within the capsule's box.
     * @param {THREE.Capsule} capsule 
     * @param {Array<THREE.Triangle>} triangles 
     */
    _getDynamicCapsuleTriangles(capsule, triangles) {
        for (const subTree of this.subTrees) {
            if (capsule.intersectsBox(subTree.box)) {
                subTree._getDynamicCapsuleTriangles(capsule, triangles);
            }
        }
        triangles.push(...this.dynamicTriangles);
    },

    /**
     * @method _getHybridRayTriangles
     * @description Fetches both static indices and dynamic objects for raycasting.
     * @param {THREE.Ray} ray 
     * @param {Object} result 
     */
    _getHybridRayTriangles(ray, result) {
        for (const subTree of this.subTrees) {
            if (ray.intersectsBox(subTree.box)) {
                subTree._getHybridRayTriangles(ray, result);
            }
        }
        for (const index of this.triangles) result.staticIndices.add(index);
        for (const tri of this.dynamicTriangles) result.dynamicTris.add(tri);
    },

    /**
     * @method getTotalTriangleCount
     * @description Calculates the sheer mass of the current node's descendants.
     * @returns {number}
     */
    getTotalTriangleCount() {
        let count = this.triangles.length;
        for (const subTree of this.subTrees) {
            count += subTree.getTotalTriangleCount();
        }
        return count;
    },

    /**
     * @method getTriangleCount
     * @description Counts the raw amount of triangles existing in the flat array.
     * @returns {number}
     */
    getTriangleCount() { 
        return this.worldTrianglesData ? this.worldTrianglesData.length / 9 : 0; 
    },

    /**
     * @method _getTriangle
     * @description 
     * Extracts the true spatial coordinates from the high-speed Float32Array 
     * memory buffer and populates a THREE.Triangle object with them.
     * 
     * @param {number} index - The ID of the triangle.
     * @param {THREE.Triangle} target - The vessel to hold the math.
     * @returns {THREE.Triangle}
     */
    _getTriangle(index, target) {
        const base = index * 9;
        if (!this.worldTrianglesData || this.worldTrianglesData.length <= base + 8) return target;
        target.a.fromArray(this.worldTrianglesData, base);
        target.b.fromArray(this.worldTrianglesData, base + 3);
        target.c.fromArray(this.worldTrianglesData, base + 6);
        return target;
    }
};
