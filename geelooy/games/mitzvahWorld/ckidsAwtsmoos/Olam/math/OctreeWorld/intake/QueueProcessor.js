
// B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { NODE_STATE } from "../constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default {
    processIntakeQueue() {
        const deadline = performance.now() + 4; 

        while (this.intakeQueue.length > 0) {
            if (performance.now() > deadline) return;

            const job = this.intakeQueue[0];
            
            if (job.group) {
                const meshes = [];
                job.group.traverse(obj => {
                    if (obj.isMesh && obj.geometry && !obj.userData.notSolid) {
                        meshes.push(obj);
                    }
                });
                this.intakeQueue.shift();
                for(const m of meshes) this.intakeQueue.unshift({ mesh: m });
                continue;
            }

            const { mesh } = this.intakeQueue.shift();
            
            const clone = new THREE.Mesh(mesh.geometry.clone()); 
            mesh.getWorldPosition(clone.position);
            mesh.getWorldQuaternion(clone.quaternion);
            mesh.getWorldScale(clone.scale);
            clone.updateMatrix();
            clone.updateMatrixWorld(true);
            
            clone.userData = { ...mesh.userData, visualReference: mesh };

            if (!clone.geometry.boundingBox) clone.geometry.computeBoundingBox();
            const worldBox = clone.geometry.boundingBox.clone().applyMatrix4(clone.matrixWorld);

            this.insertMeshOnly(this.world.root, clone, worldBox);
        }
    },
    
    insertMeshOnly(node, mesh, meshBox) {
        if (!node.box.intersectsBox(meshBox)) return false;

        if (node.type === 'LEAF') {
            const meshToAdd = mesh.parent ? mesh.clone() : mesh;
            if (mesh.parent) meshToAdd.userData = Object.assign({}, mesh.userData);

            node.physicsMeshGroup.add(meshToAdd);
            node.state = NODE_STATE.PENDING_BUILD;

            if(mesh.userData) mesh.userData.inMainWorld = true;

            if (node.physics) {
                this.world.builder.synchronouslyRebuildNode(node, meshToAdd);
            } else {
                this.world.builder.buildNodePhysics(node);
            }
            return true;
        } else {
            let placed = false;
            for (const child of node.children) {
                if (this.insertMeshOnly(child, mesh, meshBox)) {
                    placed = true;
                }
            }
            return placed;
        }
    }
};
