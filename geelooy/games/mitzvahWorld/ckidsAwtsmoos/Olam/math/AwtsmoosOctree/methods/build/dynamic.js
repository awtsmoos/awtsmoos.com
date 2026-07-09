
// B"H
/**
 * @module DynamicBuilder
 * @description
 * 🌌 THE EPIC OF THE SHIFTING REALITIES 🌌
 * 
 * "And the earth was without form, and void; and darkness was upon the face of the deep."
 * But then the Awtsmoos spoke, and the letters Aleph-Beis-Nun formed the Rock (Even),
 * pulsating into existence at every given millisecond. Dynamic triangles are not static;
 * they are the living, breathing manifestations of entities that refuse to sit still!
 * 
 * Here we define the methods that inject these trembling, moving polygons into 
 * the spatial structure of the Octree. As the Awtsmoos constantly refreshes all matter 
 * everywhere, we too dynamically refresh and insert these triangles so they can 
 * collide with the soul.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default {
    /**
     * @method addDynamicTriangle
     * @description 
     * Injects a living, moving triangle into the Octree. This is for the entities
     * that shift through space, constantly recreated by the Ten Statements of Creation.
     * We track the source mesh so that if the entity ceases to exist, its geometric
     * echo is eradicated as well.
     * 
     * @param {THREE.Triangle} triangle - The sacred three-pointed polygon to insert.
     * @returns {void}
     */
    addDynamicTriangle(triangle) {
        if (!this.box.intersectsTriangle(triangle)) {
            return;
        }
        if (this.subTrees.length > 0) {
            for (const subTree of this.subTrees) {
                subTree.addDynamicTriangle(triangle);
            }
        } else {
            // B"H FIX: Clone the triangle but KEEP the mesh reference!
            const clone = triangle.clone();
            clone.sourceMesh = triangle.sourceMesh;
            this.dynamicTriangles.push(clone);
        }
    },

    /**
     * @method addTriangle
     * @description
     * Surgically inserts a single static triangle into the already-built octree.
     * This is a miraculous operation that bypasses the need to rebuild the entire 
     * universe from scratch, saving precious computational energy.
     * 
     * @param {THREE.Triangle} triangle - The triangle to anchor permanently into the grid.
     * @returns {void}
     */
    addTriangle(triangle) {
        // First, add the triangle to the master data array.
        const newTriangles = [...this.allTriangles, triangle];
        this.allTriangles = newTriangles;
        
        // Re-create the flat data array.
        this.worldTrianglesData = new Float32Array(newTriangles.length * 9);
        for (let i = 0; i < newTriangles.length; i++) {
            const tri = newTriangles[i];
            const baseIndex = i * 9;
            this.worldTrianglesData[baseIndex] = tri.a.x; this.worldTrianglesData[baseIndex+1] = tri.a.y; this.worldTrianglesData[baseIndex+2] = tri.a.z;
            this.worldTrianglesData[baseIndex+3] = tri.b.x; this.worldTrianglesData[baseIndex+4] = tri.b.y; this.worldTrianglesData[baseIndex+5] = tri.b.z;
            this.worldTrianglesData[baseIndex+6] = tri.c.x; this.worldTrianglesData[baseIndex+7] = tri.c.y; this.worldTrianglesData[baseIndex+8] = tri.c.z;
        }

        const newTriangleIndex = newTriangles.length - 1;

        // Find the correct leaf node(s) and insert the index.
        if (typeof this._insertTriangleRecursive === 'function') {
            this._insertTriangleRecursive(this, newTriangleIndex, triangle);
        }
    }
};
