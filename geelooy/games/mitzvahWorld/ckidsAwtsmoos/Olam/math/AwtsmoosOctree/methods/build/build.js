
// B"H
/**
 * @module build
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  CHAPTER 2: THE CRYSTALLIZATION OF SPACE — THE BIG BANG OF PHYSICS           ║
 * ║                                                                                  ║
 * ║  "In the beginning, Elohim created the heavens and the earth."                ║
 * ║                                                                                  ║
 * ║  Before `build()` is called, all the triangles exist in `allTriangles` like    ║
 * ║  the formless Tohu VaVohu — without structure, without spatial organization,   ║
 * ║  all scattered in a flat, unsorted list. The collision engine cannot           ║
 * ║  use this — searching every triangle for every frame would be O(n) agony.      ║
 * ║                                                                                  ║
 * ║  `build()` is the Six Days of Creation. It:                                    ║
 * ║   1. Packs all vertices into a blazing-fast Float32Array                       ║
 * ║   2. Recursively splits the bounding box into 8 smaller boxes (the Octree)    ║
 * ║   3. Routes each triangle index to only the sub-boxes it intersects           ║
 * ║   4. Continues splitting until each leaf node has ≤8 triangles               ║
 * ║                                                                                  ║
 * ║  The result? Spatial queries that are O(log n) — the "hiding" of the          ║
 * ║  Infinite Light behind the finite screen of Tzimtzum, allowing finite          ║
 * ║  creatures (players, raycasts) to interact with infinite detail efficiently.   ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @file build.js
 * @memberof AwtsmoosOctree/methods/build
 */
import * as THREE from '/games/scripts/build/three.module.js';

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _temp_triangle = new THREE.Triangle();

/** @constant {number} MAX_DEPTH - The maximum recursion depth for tree splitting. */
const MAX_DEPTH = 55;

export default {
    /**
     * @method build
     * @description
     * THE MAIN BUILD FUNCTION. The engine of reality.
     *
     * Converts the flat `allTriangles` array into a hierarchical spatial index.
     * After this call, the Octree is ready for O(log n) collision queries.
     *
     * B"H — BACKWARDS COMPATIBILITY LOGIC:
     * If `this._isManaged` is true, the Octree is a sub-component managed by OctreeWorld.
     * Its bounding box has been precisely pre-set by the world and must NOT be cleared.
     * If `this._isManaged` is false, the Octree is standalone and rebuilds its box
     * from scratch based on the actual triangles it contains.
     *
     * @returns {Octree} `this` — allows chaining.
     */
    build() {
        // B"H: BACKWARDS COMPATIBILITY LOGIC
        if (!this._isManaged) {
            // Standalone octree: clear everything, recalculate box from triangles
            this.subTrees = [];
            this.box.makeEmpty();
        } else {
            // Managed by OctreeWorld: ONLY clear subTrees.
            // CRUCIALLY: do NOT touch the box — OctreeWorld set it precisely!
            this.subTrees = [];
        }

        // Pack all triangle data into a high-speed contiguous Float32Array.
        // This is the letters being encoded into the physical stone.
        this.worldTrianglesData = new Float32Array(this.allTriangles.length * 9);
        for (let i = 0; i < this.allTriangles.length; i++) {
            const tri = this.allTriangles[i];
            const baseIndex = i * 9;
            this.worldTrianglesData[baseIndex]     = tri.a.x;
            this.worldTrianglesData[baseIndex + 1] = tri.a.y;
            this.worldTrianglesData[baseIndex + 2] = tri.a.z;
            this.worldTrianglesData[baseIndex + 3] = tri.b.x;
            this.worldTrianglesData[baseIndex + 4] = tri.b.y;
            this.worldTrianglesData[baseIndex + 5] = tri.b.z;
            this.worldTrianglesData[baseIndex + 6] = tri.c.x;
            this.worldTrianglesData[baseIndex + 7] = tri.c.y;
            this.worldTrianglesData[baseIndex + 8] = tri.c.z;

            // B"H BACKWARDS COMPATIBILITY: Only expand box if standalone
            if (!this._isManaged) {
                this.box.expandByPoint(tri.a).expandByPoint(tri.b).expandByPoint(tri.c);
            }
        }

        // Tiny padding to ensure border triangles are not missed by intersectsBox checks
        if (this.allTriangles.length > 0) {
            this.box.min.x -= 0.01;
            this.box.min.y -= 0.01;
            this.box.min.z -= 0.01;
        }

        // Initialize all triangle indices and then recursively split
        this.triangles = Array.from(Array(this.allTriangles.length).keys());

        this.split(0);

        this.isBuilt = true;
        return this;
    },

    /**
     * @method split
     * @description
     * Recursively subdivides the current node into 8 children (an Octree subdivision).
     *
     * This is the fractal self-similarity of creation — the Sefirot within Sefirot,
     * the worlds within worlds. Each "Olam" (world/box) is divided into 8 children,
     * and each child that contains enough triangles is itself divided again.
     *
     * After distributing all triangles to children, the parent's own triangle list
     * is CLEARED. Only leaf nodes hold triangle references — this prevents the
     * catastrophic "reference explosion" where parent nodes double-count everything.
     *
     * @param {number} level - The current recursion depth (0 = root).
     */
    split(level) {
        if (this.triangles.length === 0) return;

        const halfsize = _v2.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);
        const newSubTrees = [];

        // Create 8 child boxes — the 8 Sefirot below Keter (Chochma, Bina, Chesed, Gevura, Tiferes, Netzach, Hod, Yesod, Malchus — well, 8 for 3 axes!)
        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 2; y++) {
                for (let z = 0; z < 2; z++) {
                    const box = new THREE.Box3();
                    _v1.set(x, y, z);
                    box.min.copy(this.box.min).add(_v1.multiply(halfsize));
                    box.max.copy(box.min).add(halfsize);

                    const subTree = new this.constructor(box);
                    // Share the flat data array across all children — no duplication!
                    subTree.worldTrianglesData = this.worldTrianglesData;
                    newSubTrees.push(subTree);
                }
            }
        }

        // Route each triangle index to the child boxes it intersects
        for (const index of this.triangles) {
            const tri = this._getTriangle(index, _temp_triangle);
            for (const subTree of newSubTrees) {
                if (subTree.box.intersectsTriangle(tri)) {
                    subTree.triangles.push(index);
                }
            }
        }

        // Recursively split children that are still too large
        for (const subTree of newSubTrees) {
            const len = subTree.triangles.length;
            if (len > 8 && level < MAX_DEPTH) {
                subTree.split(level + 1);
            }
            if (len !== 0) {
                this.subTrees.push(subTree);
            }
        }

        // B"H CRITICAL: After distributing to children, CLEAR this parent's list.
        // A parent with children is only a spatial container — not a triangle holder.
        // This prevents O(n^depth) duplication that would destroy performance!
        if (this.subTrees.length > 0) {
            this.triangles.length = 0;
        }
    }
};
