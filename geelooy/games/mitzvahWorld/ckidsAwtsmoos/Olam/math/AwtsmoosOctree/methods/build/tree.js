
// B"H
/**
 * @module TreeBuilder
 * @description
 * 🌳 THE SEFIROTIC DIVISION OF SPACE 🌳
 * 
 * "Let there be a firmament in the midst of the waters, and let it divide the waters from the waters."
 * 
 * Space is an illusion, an expanse created by the Tzimtzum (Constriction) of the Infinite Light.
 * To navigate this space rapidly, we must divide it into 8 distinct octants (sub-trees),
 * cascading down through levels of detail, much like the worlds of Atzilut, Beriah, Yetzirah, and Asiyah.
 * 
 * This module is responsible for physically constructing that tree, placing the triangles
 * within their proper spatial boundaries, and flattening them into a high-speed Float32Array 
 * for maximum performance!
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const MAX_DEPTH = 55;

export default {
    /**
     * @method build
     * @description 
     * The Master Architect function. Compiles the loose array of triangles into a highly 
     * optimized spatial tree and a continuous memory buffer.
     * @returns {Object} Returns the Octree instance.
     */
    build() {
        // --- BACKWARDS COMPATIBILITY LOGIC ---
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
            this.worldTrianglesData[baseIndex] = tri.a.x; this.worldTrianglesData[baseIndex+1] = tri.a.y; this.worldTrianglesData[baseIndex+2] = tri.a.z;
            this.worldTrianglesData[baseIndex+3] = tri.b.x; this.worldTrianglesData[baseIndex+4] = tri.b.y; this.worldTrianglesData[baseIndex+5] = tri.b.z;
            this.worldTrianglesData[baseIndex+6] = tri.c.x; this.worldTrianglesData[baseIndex+7] = tri.c.y; this.worldTrianglesData[baseIndex+8] = tri.c.z;

            if (!this._isManaged) {
                this.box.expandByPoint(tri.a).expandByPoint(tri.b).expandByPoint(tri.c);
            }
        }
        
        if (this.allTriangles.length > 0) {
            this.box.min.x -= 0.01; this.box.min.y -= 0.01; this.box.min.z -= 0.01;
        }

        this.triangles = Array.from(Array(this.allTriangles.length).keys());
        
        this.split(0);
        
        this.isBuilt = true;
        return this;
    },

    /**
     * @method split
     * @description 
     * Recursively divides the current node into 8 smaller octants.
     * @param {number} level - The current depth in the Tree of Life.
     * @returns {void}
     */
    split(level) {
        if (this.triangles.length === 0) return;

        const halfsize = _v2.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);
        const newSubTrees = [];
        for (let x = 0; x < 2; x++) { 
            for (let y = 0; y < 2; y++) { 
                for (let z = 0; z < 2; z++) {
                    const box = new THREE.Box3();
                    _v1.set(x, y, z);
                    box.min.copy(this.box.min).add(_v1.multiply(halfsize));
                    box.max.copy(box.min).add(halfsize);
                    const subTree = new this.constructor(box);
                    subTree.worldTrianglesData = this.worldTrianglesData;
                    newSubTrees.push(subTree);
                }
            }
        }
        
        const _temp_triangle = new THREE.Triangle();
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
            if (len > 8 && level < MAX_DEPTH) {
                subTree.split(level + 1);
            }
            if (len !== 0) {
                this.subTrees.push(subTree);
            }
        }
        
        if (this.subTrees.length > 0) {
            this.triangles.length = 0;
        }
    },

    /**
     * @method _insertTriangleRecursive
     * @description 
     * Deep insertion of a single triangle index into the already formed branches of reality.
     * @param {Object} node - The current spatial node.
     * @param {number} index - The index pointing to the flat Float32Array.
     * @param {THREE.Triangle} triangle - The mathematical bounds of the triangle.
     * @returns {void}
     */
    _insertTriangleRecursive(node, index, triangle) {
        if (!node.box.intersectsTriangle(triangle)) return;
        if (node.subTrees.length > 0) {
            for (const subTree of node.subTrees) {
                this._insertTriangleRecursive(subTree, index, triangle);
            }
        } else {
            if (node.triangles.indexOf(index) === -1) {
                node.triangles.push(index);
            }
        }
    }
};
