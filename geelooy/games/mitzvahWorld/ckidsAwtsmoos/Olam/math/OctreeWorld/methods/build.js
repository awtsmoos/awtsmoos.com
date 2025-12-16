
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { Octree } from '../index.js';

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _temp_triangle = new THREE.Triangle();
const MAX_DEPTH = 55;

export default {
    fromGraphNode(group) {
        if (!group.userData.isPreTransformed) {
            group.updateWorldMatrix(true, true);
        }
        
        group.traverse((obj) => {
            if (obj.isMesh === true) {
                if (this._allTriangles.some(tri => tri.sourceMesh === obj)) {
                    this.removeMesh(obj);
                }
                
                let geometry, isTemp = false;
                if (obj.geometry.index !== null) { isTemp = true; geometry = obj.geometry.toNonIndexed(); } 
                else { geometry = obj.geometry; }
    
                const positionAttribute = geometry.getAttribute('position');
                if (positionAttribute) {
                    for (let i = 0; i < positionAttribute.count; i += 3) {
                        const v1 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i).applyMatrix4(obj.matrixWorld);
                        const v2 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(obj.matrixWorld);
                        const v3 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(obj.matrixWorld);
                        
                        // B"H: Validation check to prevent NaN corruption
                        if (isNaN(v1.x) || isNaN(v1.y) || isNaN(v1.z) ||
                            isNaN(v2.x) || isNaN(v2.y) || isNaN(v2.z) ||
                            isNaN(v3.x) || isNaN(v3.y) || isNaN(v3.z)) {
                            continue;
                        }

                        const tri = new THREE.Triangle(v1, v2, v3);
                        tri.sourceMesh = obj;
                        this._allTriangles.push(tri);
                    }
                }
                if (isTemp) geometry.dispose();
            }
        });
    
        this._isBuilt = false;
        return this;
    },

    build() {
        if (!this._isManaged) {
            this.subTrees = []; 
            this.box.makeEmpty();
        } else {
            this.subTrees = [];
        }
        
        this._worldTrianglesData = new Float32Array(this._allTriangles.length * 9);
        for (let i = 0; i < this._allTriangles.length; i++) {
            const tri = this._allTriangles[i];
            const baseIndex = i * 9;
            this._worldTrianglesData[baseIndex] = tri.a.x; this._worldTrianglesData[baseIndex+1] = tri.a.y; this._worldTrianglesData[baseIndex+2] = tri.a.z;
            this._worldTrianglesData[baseIndex+3] = tri.b.x; this._worldTrianglesData[baseIndex+4] = tri.b.y; this._worldTrianglesData[baseIndex+5] = tri.b.z;
            this._worldTrianglesData[baseIndex+6] = tri.c.x; this._worldTrianglesData[baseIndex+7] = tri.c.y; this._worldTrianglesData[baseIndex+8] = tri.c.z;

            if (!this._isManaged) {
                this.box.expandByPoint(tri.a).expandByPoint(tri.b).expandByPoint(tri.c);
            }
        }
        
        if(this._allTriangles.length > 0){
            this.box.min.x -= 0.01; this.box.min.y -= 0.01; this.box.min.z -= 0.01;
            this.box.max.x += 0.01; this.box.max.y += 0.01; this.box.max.z += 0.01;
        }

        this.triangles = Array.from(Array(this._allTriangles.length).keys());
        
        this.split(0);
        
        this._isBuilt = true;
        return this;
    },

    split(level) {
        if(this.triangles.length === 0) return;

        const halfsize = _v2.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);
        const newSubTrees = [];
        for (let x = 0; x < 2; x++) { for (let y = 0; y < 2; y++) { for (let z = 0; z < 2; z++) {
            const box = new THREE.Box3();
            _v1.set(x, y, z);
            box.min.copy(this.box.min).add(_v1.multiply(halfsize));
            box.max.copy(box.min).add(halfsize);
            const subTree = new Octree(box);
            subTree._worldTrianglesData = this._worldTrianglesData;
            newSubTrees.push(subTree);
        }}}
        
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
    }
};
