
// B"H
/**
 * @module OctreeWorld_Queues
 * @description
 * 👷‍♂️ THE LABORERS OF THE BACKGROUND 👷‍♂️
 * 
 * Chapter 8: Managing the Inflow.
 * The world enters the queue as a formless void of meshes. This module 
 * painstakingly processes them, building their physical foundations one by one 
 * within the frame budget to ensure the user never experiences a stutter.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { CONFIG, NODE_STATE } from '../constants.js';

export default {
    /**
     * @method _processIntakeQueue
     * @description Converts groups of meshes into individual physical participants.
     */
    _processIntakeQueue() {
        const deadline = performance.now() + 4; // 4ms budget for intake
        
        while (this._intakeQueue.length > 0) {
            if (performance.now() > deadline) return;
            
            const job = this._intakeQueue.shift();
            if (job.group) {
                // Break down hierarchies into individual meshes
                const meshes = [];
                job.group.traverse(obj => {
                    if (obj.isMesh && obj.geometry && !obj.userData.notSolid) meshes.push(obj);
                });
                for(const m of meshes) this._intakeQueue.unshift({ mesh: m });
                continue;
            }
            
            const { mesh } = job;
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
     * @description Executes building, subdividing, and merging within the budget.
     */
    _processQueues() {
        const startTime = performance.now();
        const budget = CONFIG.FRAME_BUDGET;

        // 1. Build near physics
        const buildIt = this._buildQueue.values();
        for (let node of buildIt) {
            if (performance.now() - startTime > budget) return;
            this._buildQueue.delete(node);
            this._buildNodePhysics(node);
        }

        // 2. Subdivide deep details
        const subIt = this._subdivisionQueue.values();
        for (let node of subIt) {
            if (performance.now() - startTime > budget) return;
            this._subdivisionQueue.delete(node);
            this._subdivide(node);
        }

        // 3. Maintenance of the Async Forge
        if (this.jobProcessor.hasWork()) {
             const remaining = budget - (performance.now() - startTime);
             if (remaining > 0) this.jobProcessor.process(remaining);
        }
    }
};
