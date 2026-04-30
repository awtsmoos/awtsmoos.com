
// B"H
/**
 * @module dynamicTriangles
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  CHAPTER 3: THE LIVING TRIANGLES — THE CHAI OF THE OCTREE                     ║
 * ║                                                                                  ║
 * ║  "There are four categories of creation: Domem (inanimate), Tzomayach         ║
 * ║   (vegetative), Chai (living), and Medabeir (speaking)."                       ║
 * ║                                                                                  ║
 * ║  The STATIC triangles (baked into `allTriangles` and `worldTrianglesData`)     ║
 * ║  are like the Domem — the eternal stones of the world, unchanging and solid.   ║
 * ║                                                                                  ║
 * ║  But some things in the world MOVE. Doors that swing. Objects that are         ║
 * ║  placed by the player. Creatures that can stand on each other.                 ║
 * ║                                                                                  ║
 * ║  These are the DYNAMIC triangles — the Chai of physics! They are not baked.   ║
 * ║  They are inserted directly into the correct leaf nodes via `addDynamicTriangle`║
 * ║  and queried alongside the static ones in every collision check.               ║
 * ║                                                                                  ║
 * ║  When an object is destroyed (removed from scene), its dynamic triangles are   ║
 * ║  instantly ignored thanks to the `sourceMesh.parent` ghost check.             ║
 * ║  They are like a Neshama that departed — the body remains in memory for a     ║
 * ║  brief moment but is invisible to the physical world until pruned.             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @file dynamicTriangles.js
 * @memberof AwtsmoosOctree/methods/build
 */

export default {
    /**
     * @method addDynamicTriangle
     * @description
     * Inserts a living, dynamic triangle into the correct leaf node(s) of the
     * already-built Octree. Dynamic triangles are not baked into the Float32Array —
     * they are stored directly in `this.dynamicTriangles` on each leaf node.
     *
     * The triangle is cloned before insertion to preserve the sourceMesh reference
     * and prevent side effects. If this node has children, the triangle is 
     * recursively distributed to any child whose bounding box it intersects.
     *
     * @param {THREE.Triangle} triangle - The living physics triangle to insert.
     *   Must have a `sourceMesh` property pointing to the THREE.Mesh it belongs to.
     */
    addDynamicTriangle(triangle) {
        if (!this.box.intersectsTriangle(triangle)) {
            return;
        }

        if (this.subTrees.length > 0) {
            // B"H: Push down to children — only leaf nodes hold dynamic triangles!
            for (const subTree of this.subTrees) {
                subTree.addDynamicTriangle(triangle);
            }
        } else {
            // We are a leaf node. Clone and preserve the mesh reference!
            const clone = triangle.clone();
            clone.sourceMesh = triangle.sourceMesh;
            this.dynamicTriangles.push(clone);
        }
    },

    /**
     * @method addTriangle
     * @description
     * Surgically inserts a single static triangle into an already-built Octree,
     * avoiding a full rebuild. Used for incremental world-building.
     *
     * This is the key performance optimization: instead of re-traversing all meshes,
     * we just add one triangle's data to the flat array and find the right leaf.
     *
     * @param {THREE.Triangle} triangle - A static world triangle to add.
     */
    addTriangle(triangle) {
        // Add to master list
        const newTriangles = [...this.allTriangles, triangle];
        this.allTriangles = newTriangles;

        // Rebuild the flat Float32Array with the new triangle included
        this.worldTrianglesData = new Float32Array(newTriangles.length * 9);
        for (let i = 0; i < newTriangles.length; i++) {
            const tri = newTriangles[i];
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
        }

        const newTriangleIndex = newTriangles.length - 1;

        // Insert the index into the correct leaf node(s) in the existing tree
        this._insertTriangleRecursive(this, newTriangleIndex, triangle);
    },

    /**
     * @method _insertTriangleRecursive
     * @description
     * Walks the existing tree structure to find the correct leaf node(s)
     * for a newly added triangle index, and adds the index there.
     *
     * @param {Octree} node - Current tree node being checked.
     * @param {number} index - The flat array index of the new triangle.
     * @param {THREE.Triangle} triangle - The triangle geometry for intersection tests.
     * @private
     */
    _insertTriangleRecursive(node, index, triangle) {
        if (!node.box.intersectsTriangle(triangle)) return;

        if (node.subTrees.length === 0) {
            // Leaf node — insert here
            if (!node.triangles.includes(index)) {
                node.triangles.push(index);
            }
        } else {
            // Branch node — recurse to children
            for (const subTree of node.subTrees) {
                this._insertTriangleRecursive(subTree, index, triangle);
            }
        }
    }
};
