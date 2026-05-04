// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { Octree as AwtsmoosOctree } from "../../AwtsmoosOctree/index.js";
import LODNode from '../LODNode.js';

export default {
    fromGraphNode(group) {
        if (!group) return;
        
        group.updateMatrixWorld(true);
        const groupBox = new THREE.Box3().setFromObject(group);
        if (groupBox.isEmpty()) return;

        if (!this.root) this.root = new LODNode(groupBox.clone());
        else this.root.box.union(groupBox);

        const meshes =[];
        let totalVerts = 0;

        group.traverse(obj => {
            if (obj.isMesh && obj.geometry && !obj.userData.notSolid) {
                meshes.push(obj);
                if (obj.geometry.attributes.position) {
                    totalVerts += obj.geometry.attributes.position.count;
                }
            }
        });
        
        // B"H: silent


        for (const mesh of meshes) {
            if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
            const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);

            const clone = new THREE.Mesh(mesh.geometry.clone());
            mesh.getWorldPosition(clone.position);
            mesh.getWorldQuaternion(clone.quaternion);
            mesh.getWorldScale(clone.scale);
            clone.updateMatrix();
            clone.updateMatrixWorld(true);
            clone.userData = { ...mesh.userData, visualReference: mesh };

            const tempGroup = new THREE.Group();
            tempGroup.add(clone);

            const sat = new AwtsmoosOctree(worldBox);
            sat.fromGraphNode(tempGroup);
            sat.build();
            sat.creationTime = performance.now();
            sat.sourceMesh = mesh;
            this._pendingOctrees.push(sat);
        }
        
        this._intakeQueue.push({ group: group, isStaticWorld: true });
    }
};