
// B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _temp_triangle = new THREE.Triangle();

export default {
    split(level) {
        if(this.triangles.length === 0) return;

        const halfsize = _v2.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);
        const newSubTrees =[];
        
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
            if (len > (this.config.MAX_TRIANGLES_PER_NODE || 32) && level < (this.config.MAX_DEPTH || 8)) {
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

    getTotalTriangleCount() {
        let count = this.triangles.length;
        for (const subTree of this.subTrees) {
            count += subTree.getTotalTriangleCount();
        }
        return count;
    }
};
