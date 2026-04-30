
// B"H
/**
 * @module getTriangle
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  CHAPTER 5: READING THE LETTERS FROM THE STONE                                 ║
 * ║                                                                                  ║
 * ║  The Float32Array is the "Even" (stone) — the letters of creation are          ║
 * ║  encoded inside it. But to work with them, you need to extract them:           ║
 * ║  to read the Aleph-Beis-Nun from the rock and reconstruct the triangle.        ║
 * ║                                                                                  ║
 * ║  `_getTriangle` is that reading. Given an index, it locates the nine           ║
 * ║  floating-point numbers in the packed array (3 vertices × 3 components = 9)   ║
 * ║  and loads them into a reusable THREE.Triangle target object.                  ║
 * ║                                                                                  ║
 * ║  The use of a pre-allocated `target` triangle (passed in from outside) is      ║
 * ║  critical for performance: it avoids garbage collection pressure by            ║
 * ║  reusing the same object every frame instead of creating new ones.             ║
 * ║  Like the Tzaddik who uses the same holy garments to access the Awtsmoos       ║
 * ║  again and again — the vessel is reused, only the light changes.               ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @file getTriangle.js
 * @memberof AwtsmoosOctree/methods/build
 */

export default {
    /**
     * @method _getTriangle
     * @description
     * Extracts a triangle from the packed `worldTrianglesData` Float32Array
     * by its integer index, and loads its vertex coordinates into `target`.
     *
     * This is a performance-critical inner loop function. It avoids allocating
     * new Vector3 objects by using THREE.Triangle's `.a`, `.b`, `.c` directly
     * with `.fromArray()`.
     *
     * Guards against out-of-bounds access by checking array size before read.
     *
     * @param {number} index - The zero-based integer index of the triangle.
     * @param {THREE.Triangle} target - A pre-allocated Triangle to fill with data.
     *   MUST be a live THREE.Triangle instance. Its vertices will be overwritten.
     * @returns {THREE.Triangle} The filled `target` triangle (same reference).
     */
    _getTriangle(index, target) {
        const base = index * 9;

        // B"H: Bounds check — never read past the end of the sacred array!
        if (!this.worldTrianglesData || this.worldTrianglesData.length <= base + 8) {
            return target;
        }

        target.a.fromArray(this.worldTrianglesData, base);
        target.b.fromArray(this.worldTrianglesData, base + 3);
        target.c.fromArray(this.worldTrianglesData, base + 6);

        return target;
    },

    /**
     * @method getTriangleCount
     * @description
     * Returns the total number of static triangles currently stored in the
     * packed Float32Array. Each triangle consumes 9 float values (3 vertices × 3 axes).
     *
     * @returns {number} The triangle count, or 0 if the array has not been built yet.
     */
    getTriangleCount() {
        return this.worldTrianglesData ? this.worldTrianglesData.length / 9 : 0;
    },

    /**
     * @method getTotalTriangleCount
     * @description
     * Recursively counts ALL triangle indices across this node and all its
     * subtree descendants. Used for diagnostics and performance profiling.
     *
     * @returns {number} The total count of triangle index slots in the tree.
     */
    getTotalTriangleCount() {
        let count = this.triangles.length;
        for (const subTree of this.subTrees) {
            count += subTree.getTotalTriangleCount();
        }
        return count;
    }
};
