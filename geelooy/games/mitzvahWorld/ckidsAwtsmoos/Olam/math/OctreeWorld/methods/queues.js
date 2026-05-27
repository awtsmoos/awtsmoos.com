
// B"H
/**
 * @module OctreeWorld_Queues
 * @description
 * Memory-safe queue processing for desert visibility. Work is capped per frame,
 * and complex meshes are rejected before geometry is cloned.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { CONFIG } from '../constants.js';

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
    /**
     * @method _processIntakeQueue
     * @description Converts queued groups/meshes into bounded physical participants.
     */
    _processIntakeQueue() {
        const deadline = performance.now() + CONFIG.INTAKE_FRAME_BUDGET;
        let processed = 0;

        while (this._intakeQueue.length > 0) {
            if (performance.now() > deadline) return;
            if (processed++ >= CONFIG.MAX_INTAKE_PER_FRAME) return;

            const job = this._intakeQueue.shift();
            if (!job) continue;

            if (job.group) {
                const meshes = [];
                job.group.traverse(obj => {
                    if (meshes.length >= CONFIG.MAX_TOTAL_INTAKE_QUEUE) return;
                    if (shouldQueueMesh(obj)) meshes.push(obj);
                });

                for (let i = meshes.length - 1; i >= 0; i--) {
                    if (this._intakeQueue.length >= CONFIG.MAX_TOTAL_INTAKE_QUEUE) break;
                    this._intakeQueue.unshift({ mesh: meshes[i] });
                }
                continue;
            }

            const { mesh } = job;
            if (!shouldQueueMesh(mesh)) continue;

            mesh.updateMatrixWorld(true);
            const clone = new THREE.Mesh(mesh.geometry.clone());
            mesh.getWorldPosition(clone.position);
            mesh.getWorldQuaternion(clone.quaternion);
            mesh.getWorldScale(clone.scale);
            clone.updateMatrix();
            clone.updateMatrixWorld(true);
            clone.userData = { ...mesh.userData, visualReference: mesh };

            if (!clone.geometry.boundingBox) clone.geometry.computeBoundingBox();
            const worldBox = clone.geometry.boundingBox.clone().applyMatrix4(clone.matrixWorld);
            this._insertMeshOnly(this.root, clone, worldBox);
        }
    },

    /**
     * @method _processQueues
     * @description Executes building/subdividing within strict frame budget.
     */
    _processQueues() {
        const startTime = performance.now();
        const budget = CONFIG.FRAME_BUDGET;

        const buildIt = this._buildQueue.values();
        for (let node of buildIt) {
            if (performance.now() - startTime > budget) return;
            this._buildQueue.delete(node);
            this._buildNodePhysics(node);
        }

        const subIt = this._subdivisionQueue.values();
        for (let node of subIt) {
            if (performance.now() - startTime > budget) return;
            this._subdivisionQueue.delete(node);
            this._subdivide(node);
        }

        if (this.jobProcessor.hasWork()) {
            const remaining = budget - (performance.now() - startTime);
            if (remaining > 0) this.jobProcessor.process(remaining);
        }
    }
};
