// B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import LODNode from '../LODNode.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { CONFIG } from '../constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

function triangleCountOf(geometry) {
    if (!geometry || !geometry.attributes || !geometry.attributes.position) return 0;
    const count = geometry.index ? geometry.index.count : geometry.attributes.position.count;
    return Math.ceil(count / 3);
}

function shouldQueueMesh(obj) {
    if (!obj || !obj.isMesh || !obj.geometry) return false;
    if (obj.userData?.notSolid || obj.userData?.skipOctree || obj.userData?.noOctree) return false;
    if (obj.isSkinnedMesh || obj.isInstancedMesh) return false;
    if (obj.type === 'SkinnedMesh' || obj.type === 'InstancedMesh') return false;
    return triangleCountOf(obj.geometry) <= CONFIG.MAX_TRIANGLES_PER_MESH;
}

export default {
    fromGraphNode(group) {
        if (!group) return;

        group.updateMatrixWorld(true);
        const groupBox = new THREE.Box3().setFromObject(group);
        if (groupBox.isEmpty()) return;

        if (!this.root) this.root = new LODNode(groupBox.clone());
        else this.root.box.union(groupBox);

        const meshes = [];
        group.traverse(obj => {
            if (meshes.length >= CONFIG.MAX_TOTAL_INTAKE_QUEUE) return;
            if (shouldQueueMesh(obj)) meshes.push(obj);
        });

        for (let i = 0; i < meshes.length; i++) {
            if (this._intakeQueue.length >= CONFIG.MAX_TOTAL_INTAKE_QUEUE) break;
            this._intakeQueue.push({ mesh: meshes[i] });
        }

        if (!this._octreeGraphLoadCount) this._octreeGraphLoadCount = 0;
        this._octreeGraphLoadCount++;
        if (this._octreeGraphLoadCount <= 8) {
            console.warn('B"H | OCTREE_GRAPH_INTAKE_BOUNDED', {
                acceptedMeshes: meshes.length,
                queueLength: this._intakeQueue.length
            });
        }
    }
};
