
// B"H
/**
 * @module OctreeWorld_AddObject
 * @description
 * Tiny memory-safe intake for visible desert loading. Only simple solid meshes
 * enter physics. Complex decorative/skinned/generated objects are skipped so
 * the renderer can keep showing the world instead of drowning in octree clones.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { Octree as AwtsmoosOctree } from "../../AwtsmoosOctree/index.js";
import LODNode from '../LODNode.js';
import { CONFIG } from '../constants.js';

function triangleCountOf(geometry) {
    if (!geometry || !geometry.attributes || !geometry.attributes.position) return 0;
    const count = geometry.index ? geometry.index.count : geometry.attributes.position.count;
    return Math.ceil(count / 3);
}

function isFiniteBox(box) {
    return box &&
        Number.isFinite(box.min.x) && Number.isFinite(box.min.y) && Number.isFinite(box.min.z) &&
        Number.isFinite(box.max.x) && Number.isFinite(box.max.y) && Number.isFinite(box.max.z);
}

function shouldSkipMesh(mesh, triCount, worldBox) {
    if (!mesh || !mesh.geometry) return true;
    if (mesh.userData?.notSolid || mesh.userData?.skipOctree || mesh.userData?.noOctree) return true;
    if (mesh.isSkinnedMesh || mesh.isInstancedMesh) return true;
    if (mesh.type === 'SkinnedMesh' || mesh.type === 'InstancedMesh') return true;
    if (triCount <= 0 || triCount > CONFIG.MAX_TRIANGLES_PER_MESH) return true;
    if (!isFiniteBox(worldBox) || worldBox.isEmpty()) return true;
    const size = worldBox.getSize(new THREE.Vector3());
    return size.x > CONFIG.MAX_WORLD_BOX_SIZE || size.y > CONFIG.MAX_WORLD_BOX_SIZE || size.z > CONFIG.MAX_WORLD_BOX_SIZE;
}

export default {
    addObject(mesh) {
        if (!mesh || !mesh.geometry) return false;

        mesh.updateMatrixWorld(true);

        const elements = mesh.matrixWorld.elements;
        for (let i = 0; i < 16; i++) {
            if (!Number.isFinite(elements[i])) return false;
        }

        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
        const triCount = triangleCountOf(mesh.geometry);

        if (shouldSkipMesh(mesh, triCount, worldBox)) {
            if (!this._octreeSkipCount) this._octreeSkipCount = 0;
            this._octreeSkipCount++;
            if (this._octreeSkipCount <= 12) {
                console.warn('B"H | OCTREE_SKIP_COMPLEX_MESH', {
                    name: mesh.name || mesh.type,
                    type: mesh.type,
                    triCount
                });
            }
            return false;
        }

        if (!this.root) this.root = new LODNode(worldBox.clone());
        else this.root.box.union(worldBox);

        const physicsClone = new THREE.Mesh(mesh.geometry.clone());
        mesh.getWorldPosition(physicsClone.position);
        mesh.getWorldQuaternion(physicsClone.quaternion);
        mesh.getWorldScale(physicsClone.scale);
        physicsClone.updateMatrix();
        physicsClone.updateMatrixWorld(true);
        physicsClone.userData = { ...mesh.userData, visualReference: mesh, inMainWorld: true };

        // B"H: no debug EdgesGeometry here. That allocation was a memory amplifier.

        if (this._pendingOctrees.length < CONFIG.MAX_PENDING_OCTREES) {
            const tempGroup = new THREE.Group();
            const satClone = new THREE.Mesh(mesh.geometry.clone());
            satClone.copy(physicsClone);
            satClone.updateMatrix();
            satClone.updateMatrixWorld(true);
            satClone.userData = { ...mesh.userData, visualReference: mesh };
            tempGroup.add(satClone);

            const satelliteOctree = new AwtsmoosOctree(worldBox.clone().expandByScalar(0.05));
            satelliteOctree._isManaged = true;
            satelliteOctree.fromGraphNode(tempGroup);
            satelliteOctree.build();
            satelliteOctree.creationTime = performance.now();
            satelliteOctree.sourceMesh = mesh;
            this._pendingOctrees.push(satelliteOctree);
        }

        this._insertMeshOnly(this.root, physicsClone, worldBox);
        return true;
    }
};
