
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _temp_triangle = new THREE.Triangle();
const MAX_DEPTH = 8;
const MAX_TRIANGLES_TO_BUILD = 12000;

export default {
    addDynamicTriangle(triangle) {
        if (!this.box.intersectsTriangle(triangle)) return;
        if (this.subTrees.length > 0) {
            for (const subTree of this.subTrees) subTree.addDynamicTriangle(triangle);
        } else {
            const clone = triangle.clone();
            clone.sourceMesh = triangle.sourceMesh;
            this.dynamicTriangles.push(clone);
        }
    },

    addTriangle(triangle) {
        if (this.allTriangles.length >= MAX_TRIANGLES_TO_BUILD) return;
        const newTriangles = [...this.allTriangles, triangle];
        this.allTriangles = newTriangles;

        this.worldTrianglesData = new Float32Array(newTriangles.length * 9);
        for (let i = 0; i < newTriangles.length; i++) {
            const tri = newTriangles[i];
            const baseIndex = i * 9;
            this.worldTrianglesData[baseIndex] = tri.a.x;
            this.worldTrianglesData[baseIndex + 1] = tri.a.y;
            this.worldTrianglesData[baseIndex + 2] = tri.a.z;
            this.worldTrianglesData[baseIndex + 3] = tri.b.x;
            this.worldTrianglesData[baseIndex + 4] = tri.b.y;
            this.worldTrianglesData[baseIndex + 5] = tri.b.z;
            this.worldTrianglesData[baseIndex + 6] = tri.c.x;
            this.worldTrianglesData[baseIndex + 7] = tri.c.y;
            this.worldTrianglesData[baseIndex + 8] = tri.c.z;
        }

        this._insertTriangleRecursive(this, newTriangles.length - 1, triangle);
    },

    fromGraphNode(group) {
        if (!group) return this;

        if (!group.userData?.isPreTransformed) group.updateWorldMatrix(true, true);

        group.traverse(obj => {
            if (this.allTriangles.length >= MAX_TRIANGLES_TO_BUILD) return;
            if (obj.isMesh !== true || !obj.geometry) return;

            if (this.allTriangles.some(tri => tri.sourceMesh === obj)) this.removeMesh(obj);

            let geometry;
            let isTemp = false;
            if (obj.geometry.index !== null) {
                isTemp = true;
                geometry = obj.geometry.toNonIndexed();
            } else {
                geometry = obj.geometry;
            }

            const positionAttribute = geometry.getAttribute('position');
            if (positionAttribute) {
                const maxVerts = Math.min(
                    positionAttribute.count,
                    (MAX_TRIANGLES_TO_BUILD - this.allTriangles.length) * 3
                );

                for (let i = 0; i + 2 < maxVerts; i += 3) {
                    const v1 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i).applyMatrix4(obj.matrixWorld);
                    const v2 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(obj.matrixWorld);
                    const v3 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(obj.matrixWorld);
                    const tri = new THREE.Triangle(v1, v2, v3);
                    tri.sourceMesh = obj;
                    this.allTriangles.push(tri);
                }
            }

            if (isTemp) geometry.dispose();
        });

        this.isBuilt = false;
        return this;
    },

    removeMesh(mesh) {
        const originalCount = this.allTriangles.length;
        this.allTriangles = this.allTriangles.filter(tri => tri.sourceMesh !== mesh);
        this.dynamicTriangles = this.dynamicTriangles.filter(tri => tri.sourceMesh !== mesh);

        if (this.allTriangles.length < originalCount) {
            this.isBuilt = false;
            this.worldTrianglesData = null;
            this.build();
        }
        return this;
    },

    pruneDeadTriangles() {
        const startSize = this.allTriangles.length;
        this.allTriangles = this.allTriangles.filter(tri => tri.sourceMesh && tri.sourceMesh.parent);
        this.dynamicTriangles = this.dynamicTriangles.filter(tri => tri.sourceMesh && tri.sourceMesh.parent);

        if (this.allTriangles.length < startSize) {
            this.isBuilt = false;
            this.worldTrianglesData = null;
            this.build();
            console.log(`B"H - Pruned ${startSize - this.allTriangles.length} dead triangles from physics.`);
        }
    },

    build() {
        if (!this._isManaged) {
            this.subTrees = [];
            this.box.makeEmpty();
        } else {
            this.subTrees = [];
        }

        if (this.allTriangles.length > MAX_TRIANGLES_TO_BUILD) {
            console.warn(`B"H | AWTSMOOS_OCTREE_TRIANGLE_CAP | had=${this.allTriangles.length} | kept=${MAX_TRIANGLES_TO_BUILD}`);
            this.allTriangles.length = MAX_TRIANGLES_TO_BUILD;
        }

        this.worldTrianglesData = new Float32Array(this.allTriangles.length * 9);
        for (let i = 0; i < this.allTriangles.length; i++) {
            const tri = this.allTriangles[i];
            const baseIndex = i * 9;
            this.worldTrianglesData[baseIndex] = tri.a.x;
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
        this.split(0);
        this.isBuilt = true;
        return this;
    },

    split(level) {
        if (this.triangles.length === 0) return;
        if (level >= MAX_DEPTH || this.triangles.length <= 24) return;

        const halfsize = _v2.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);
        if (!Number.isFinite(halfsize.x) || !Number.isFinite(halfsize.y) || !Number.isFinite(halfsize.z)) return;
        if (halfsize.lengthSq() < 0.0001) return;

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

        for (const index of this.triangles) {
            const tri = this._getTriangle(index, _temp_triangle);
            for (const subTree of newSubTrees) {
                if (subTree.box.intersectsTriangle(tri)) subTree.triangles.push(index);
            }
        }

        for (const subTree of newSubTrees) {
            const len = subTree.triangles.length;
            if (len > 24 && level < MAX_DEPTH) subTree.split(level + 1);
            if (len !== 0) this.subTrees.push(subTree);
        }

        if (this.subTrees.length > 0) this.triangles.length = 0;
    }
};
