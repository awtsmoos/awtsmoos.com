
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
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _temp_triangle = new THREE.Triangle();


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
        // B"H: silent

        if (!this._isManaged) {
            this.subTrees = [];
            this.box.makeEmpty();
        } else {
            this.subTrees = [];
        }

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

            if (!this._isManaged) {
                this.box.expandByPoint(tri.a).expandByPoint(tri.b).expandByPoint(tri.c);
            }
        }

        if (this.allTriangles.length > 0) {
            this.box.min.x -= 0.01;
            this.box.min.y -= 0.01;
            this.box.min.z -= 0.01;
        }

        this.triangles = Array.from(Array(this.allTriangles.length).keys());

        try {
            this.split(0);
        } catch(e) {
            console.error("B\"H - 🚨 AwtsmoosOctree: Split Failure!", e);
            throw e;
        }

        this.isBuilt = true;
        // B"H: silent

        return this;
    },

    split(level) {
        if (this.triangles.length === 0) return;
        
        if (level > 4) { // Only log deep splits to avoid spamming the first levels
             // B"H: silent

        }

        const halfsize = _v2.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);
        const newSubTrees = [];

        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 2; y++) {
                for (let z = 0; z < 2; z++) {
                    const box = new THREE.Box3();
                    _v1.set(x, y, z);
                    box.min.copy(this.box.min).add(_v1.multiply(halfsize));
                    box.max.copy(box.min).add(halfsize);

                    const subTree = new this.constructor(box, this.config);
                    subTree.worldTrianglesData = this.worldTrianglesData;
                    newSubTrees.push(subTree);
                }
            }
        }

        for (const index of this.triangles) {
            const tri = this._getTriangle(index, _temp_triangle);
            for (const subTree of newSubTrees) {
                if (subTree.box.intersectsTriangle(tri)) {
                    subTree.triangles.push(index);
                }
            }
        }

        for (const subTree of newSubTrees) {
            const len = subTree.triangles.length;
            if (len > this.config.MAX_TRIANGLES_PER_NODE && level < this.config.MAX_DEPTH) {
                subTree.split(level + 1);
            }
            if (len !== 0) {
                this.subTrees.push(subTree);
            }
        }

        if (this.subTrees.length > 0) {
            this.triangles.length = 0;
        }
    }
};
