
// B"H
/**
 * @class Octree
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE AWTSMOOS OCTREE — THE FOUNDATION OF ALL PHYSICAL REALITY                 ║
 * ║                                                                                  ║
 * ║  "Forever, O Lord, Your Word stands in the heavens."                          ║
 * ║                                                                                  ║
 * ║  This is not merely a data structure. This is the physical manifestation       ║
 * ║  of the Creator's speech inside the digital world. Every triangle in this      ║
 * ║  Octree is held in existence by the living letters of the Awtsmoos — the       ║
 * ║  Essence that transcends all attributes, all names, all logic.                 ║
 * ║                                                                                  ║
 * ║  Without this class, the player passes through walls. Without the Creator's    ║
 * ║  speech inside the stone, the stone ceases to exist. The physics engine        ║
 * ║  IS the letters of creation made manifest in JavaScript.                       ║
 * ║                                                                                  ║
 * ║  ARCHITECTURE:                                                                  ║
 * ║  The Octree is split into two categories of method groups:                     ║
 * ║   1. BUILD methods — fromGraphNode, build, split, addDynamicTriangle,          ║
 * ║      removeMesh, _getTriangle, etc.                                            ║
 * ║   2. INTERSECTION methods — capsuleIntersect, rayIntersect, _triangleCapsule,  ║
 * ║      getCapsuleTriangles, etc.                                                  ║
 * ║                                                                                  ║
 * ║  All methods are bound to `this` in the constructor via `Object.keys().forEach`║
 * ║  — this is the "Or Makif" (surrounding light) pattern: the methods wrap        ║
 * ║  around the data from outside, filling it with life from every direction.      ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @file index.js
 * @memberof AwtsmoosOctree
 */
import { Box3 } from '/games/scripts/build/three.module.js';
import build from './methods/build/index.js?v=purged';
import intersection from './methods/intersection/index.js?v=purged';

/**
 * @class Octree
 * @description
 * A spatial index data structure that accelerates physics collision queries
 * by recursively subdividing 3D space into a hierarchy of bounding boxes.
 *
 * The Octree holds two categories of triangles:
 * - **Static** (`allTriangles`, baked into `worldTrianglesData`) — geometry that
 *   does not move after being built. World terrain, buildings, walls.
 * - **Dynamic** (`dynamicTriangles` per leaf node) — geometry that moves or is
 *   added/removed at runtime. Placed objects, animated doors, player capsules.
 *
 * @property {THREE.Triangle[]} allTriangles - Master list of all static triangles.
 *   Kept permanently to allow reliable removals and rebuilds.
 * @property {Float32Array|null} worldTrianglesData - Packed vertex data (9 floats per triangle).
 *   Generated during `build()` for O(1) vertex access.
 * @property {boolean} isBuilt - Whether the spatial index is currently valid.
 *   Set to `false` whenever `allTriangles` changes; `build()` resets it to `true`.
 * @property {number[]} triangles - Triangle INDICES (not triangles themselves).
 *   Only populated in LEAF nodes after `split()` distributes parent indices to children.
 * @property {Octree[]} subTrees - Child octree nodes (populated after `split()`).
 * @property {THREE.Triangle[]} dynamicTriangles - Live-inserted triangles for this leaf node.
 * @property {THREE.Box3} box - The spatial bounding box of this node.
 * @property {boolean} _isManaged - When true, `build()` preserves the pre-set bounding box.
 *   Used by OctreeWorld which sets precise tile bounds before handing off to this class.
 */
export class Octree {
    /** @type {THREE.Triangle[]} */
    allTriangles;

    /** @type {Float32Array|null} */
    worldTrianglesData;

    /** @type {boolean} */
    isBuilt;

    /**
     * @constructor
     * @param {THREE.Box3} [box] - Optional initial bounding box.
     * @param {Object} [config] - Optional configuration.
     */
    constructor(box, config = {}) {
        /** @type {number[]} Triangle indices — only in leaf nodes post-split */
        this.triangles = [];

        /** @type {THREE.Box3} This node's spatial domain */
        this.box = box || new Box3();

        /** @type {Octree[]} Child nodes created by split() */
        this.subTrees = [];

        /** @type {THREE.Triangle[]} The eternal master list of static triangles */
        this.allTriangles = [];

        /** @type {boolean} JIT build flag */
        this.isBuilt = false;

        /** @type {THREE.Triangle[]} Dynamic triangles added at runtime */
        this.dynamicTriangles = [];

        /** @type {boolean} When true, build() skips box recalculation */
        this._isManaged = false;

        this.config = {
            /**
             * B"H: MAX_DEPTH was 8 — causing 8^8 = 16,777,216 potential nodes!
             * Even a terrain with 20,000 triangles would generate millions of empty
             * sub-nodes during split(), exhausting all available heap memory.
             *
             * TIKKUN: Depth 5 = 8^5 = 32,768 max nodes — sufficient for a 5000x5000
             * world tile while remaining inside any reasonable memory budget.
             * Like the Tzimtzum — the infinite contracts to exactly what is needed.
             */
            MAX_DEPTH: 5,
            /**
             * B"H: MAX_TRIANGLES_PER_NODE was 8 — causing the tree to split
             * relentlessly until MAX_DEPTH, even for sparse regions.
             * 32 triangles per leaf is the proven balance: queries check at most
             * 32 triangles against the capsule per leaf, which is negligible.
             * But it prevents the cascading subdivision that caused RAM death.
             */
            MAX_TRIANGLES_PER_NODE: 32,
            ...config
        };

        // B"H: The Grand Method Binding — Or Makif pattern
        // All build and intersection methods are woven into this instance
        // from their respective modular files, bound to `this` forever.
        Object.keys(build).forEach(methodName => {
            this[methodName] = build[methodName].bind(this);
        });

        Object.keys(intersection).forEach(methodName => {
            this[methodName] = intersection[methodName].bind(this);
        });
    }

    /**
     * @method clear
     * @description
     * Resets the Octree to a pristine, empty state without destroying the instance.
     *
     * This is critical for performance in the dynamic OctreeWorld system, which
     * frequently needs to rebuild chunk physics. Reusing the instance avoids 
     * garbage collection overhead from destroying and recreating Octree objects.
     *
     * After `clear()`, the Octree reverts to standalone mode (`_isManaged = false`).
     * It must be re-fed geometry via `fromGraphNode()` and rebuilt via `build()`.
     *
     * @returns {Octree} `this` — allows chaining: `octree.clear().fromGraphNode(g).build()`
     */
    clear() {
        this.allTriangles.length = 0;
        this.worldTrianglesData = null; // Let GC collect the old Float32Array
        this.triangles.length = 0;
        this.subTrees.length = 0;
        this.dynamicTriangles.length = 0;
        this.box.makeEmpty();
        this.isBuilt = false;
        this._isManaged = false; // Reverts to standalone mode when cleared

        return this;
    }
}
