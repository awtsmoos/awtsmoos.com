
// B"H
/**
 * @module removeMesh
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  CHAPTER 4: THE ANNIHILATION AND REBIRTH — THE SHEVIRAT HAKELIM OF PHYSICS   ║
 * ║                                                                                  ║
 * ║  "The vessels shattered. The shards fell."                                     ║
 * ║                                                                                  ║
 * ║  When a physical object is destroyed in the game — a wall blown up, a         ║
 * ║  platform retracted, a chest opened and removed — its visual mesh is           ║
 * ║  removed from the THREE.js scene. But the Octree still holds its triangles!    ║
 * ║  These are the Klipot — the empty husks — the ghost collisions that haunt     ║
 * ║  the player, making them collide with invisible geometry.                       ║
 * ║                                                                                  ║
 * ║  `removeMesh` performs the Tikkun — the rectification. It filters every        ║
 * ║  triangle whose `sourceMesh` matches the target from `allTriangles` and        ║
 * ║  `dynamicTriangles`, then triggers a full `build()` to purify the spatial      ║
 * ║  index from the corrupted shards of what once was.                             ║
 * ║                                                                                  ║
 * ║  `pruneDeadTriangles` is the automatic background Tikkun — running             ║
 * ║  periodically to sweep out any triangle whose `sourceMesh.parent` is null,    ║
 * ║  meaning it was silently removed from the scene without explicit notification. ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @file removeMesh.js
 * @memberof AwtsmoosOctree/methods/build
 */

export default {
    /**
     * @method removeMesh
     * @description
     * Surgically removes all triangles whose `sourceMesh` matches the given mesh.
     * After removal, immediately triggers `build()` to rebuild the spatial index.
     *
     * This is used for small, managed node octrees where a rebuild is fast.
     * For large world octrees, prefer `pruneDeadTriangles` which is batched.
     *
     * @param {THREE.Mesh} mesh - The mesh whose triangles should be purged.
     * @returns {Octree} `this` — allows chaining.
     */
    removeMesh(mesh) {
        const originalCount = this.allTriangles.length;

        // Purge from static triangle master list
        this.allTriangles = this.allTriangles.filter(tri => tri.sourceMesh !== mesh);

        // Purge from dynamic triangle list
        this.dynamicTriangles = this.dynamicTriangles.filter(tri => tri.sourceMesh !== mesh);

        if (this.allTriangles.length < originalCount) {
            // The triangle data has changed — the spatial index is now stale.
            // Mark as unbuilt and immediately rebuild for this small chunk.
            this.isBuilt = false;
            this.worldTrianglesData = null;
            this.build(); // Rebuild immediately (only used on small managed nodes)
        }

        return this;
    },

    /**
     * @method pruneDeadTriangles
     * @description
     * Background cleanup task. Scans ALL triangles and removes any whose
     * `sourceMesh` has been disconnected from the scene (no `.parent`).
     *
     * This is the eternal background Tikkun — the sweeping of Klipot that
     * accumulate over time as objects are silently removed. Run this
     * periodically (e.g., every 60 frames) from the game loop.
     *
     * After pruning, if anything was removed, rebuilds the spatial index.
     */
    pruneDeadTriangles() {
        const startSize = this.allTriangles.length;

        // 1. Filter out anything whose source mesh was silently removed from scene
        this.allTriangles = this.allTriangles.filter(tri => {
            return tri.sourceMesh && tri.sourceMesh.parent;
        });

        this.dynamicTriangles = this.dynamicTriangles.filter(tri => {
            return tri.sourceMesh && tri.sourceMesh.parent;
        });

        // 2. If we removed anything, rebuild the spatial tree
        const pruned = startSize - this.allTriangles.length;
        if (pruned > 0) {
            this.isBuilt = false;
            this.worldTrianglesData = null;
            this.build();
            // B"H: silent

        }
    }
};
