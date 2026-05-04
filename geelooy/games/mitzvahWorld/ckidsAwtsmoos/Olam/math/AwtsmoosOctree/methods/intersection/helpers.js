
// B"H
/**
 * @module IntersectionHelpers
 * @description
 * 🧭 THE GUIDES OF THE LABYRINTH 🧭
 *
 * ⚡ MEMORY OVERFLOW TIKKUN — ROOT CAUSE #2 ELIMINATED:
 * The previous `getCapsuleTriangles` used `triangles.indexOf(index) === -1`
 * inside a loop — O(n) search inside an O(n) loop = O(n²) PER FRAME.
 * With thousands of terrain triangles, at 60fps, this turned a flat plane
 * into a memory furnace.
 *
 * SOLUTION: The deduplication Set is owned by the ROOT caller and passed
 * downward. Each leaf node does a single O(1) Set.has() check.
 * The Set is converted to Array ONCE at the top level.
 *
 * Like the Awtsmoos Who does not repeat His creations unnecessarily —
 * each triangle index exists ONCE in the sacred gathering.
 */
export default {
    /**
     * @method getCapsuleTriangles
     * @description
     * Gathers all UNIQUE static triangle indices within the capsule's reach.
     * Accepts a Set (for O(1) deduplication) or an Array (legacy fallback).
     *
     * @param {THREE.Capsule} capsule - The physical vessel of the soul.
     * @param {Set<number>|Array<number>} triangles - Accumulator. Prefer Set.
     */
    getCapsuleTriangles(capsule, triangles) {
        const isSet = triangles instanceof Set;
        for (const subTree of this.subTrees) {
            if (capsule.intersectsBox(subTree.box)) {
                subTree.getCapsuleTriangles(capsule, triangles);
            }
        }
        for (const index of this.triangles) {
            if (isSet) {
                triangles.add(index); // O(1) — the Awtsmoos knows each letter precisely
            } else if (triangles.indexOf(index) === -1) {
                triangles.push(index); // Legacy fallback
            }
        }
    },

    /**
     * @method getRayTriangles
     * @description
     * Gathers all UNIQUE static triangle indices within the ray's bounds.
     * Accepts a Set (for O(1) deduplication) or an Array (legacy fallback).
     *
     * @param {THREE.Ray} ray - The gaze of inquiry cast into existence.
     * @param {Set<number>|Array<number>} triangles - Accumulator. Prefer Set.
     */
    getRayTriangles(ray, triangles) {
        const isSet = triangles instanceof Set;
        for (const subTree of this.subTrees) {
            if (ray.intersectsBox(subTree.box)) {
                subTree.getRayTriangles(ray, triangles);
            }
        }
        for (const index of this.triangles) {
            if (isSet) {
                triangles.add(index);
            } else if (triangles.indexOf(index) === -1) {
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
