// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import LODNode from "../LODNode.js";
import { Octree as AwtsmoosOctree } from "../../AwtsmoosOctree/index.js";

const _v1 = new THREE.Vector3();

export default {
    addObject(mesh) {
        if (!mesh) return false;

        mesh.updateMatrixWorld(true);
        
        // B"H: NaN Guard
        const p = mesh.position;
        if (isNaN(p.x) || isNaN(p.y) || isNaN(p.z)) {
            console.warn(`B"H: Rejected mesh ${mesh.name} from Octree due to NaN position.`);
            return false;
        }

        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);

        if (isNaN(worldBox.min.x) || isNaN(worldBox.max.x)) {
             console.warn(`B"H: Rejected mesh ${mesh.name} from Octree due to NaN bounding box.`);
             return false;
        }

        if (!this.world.root) {
            this.world.root = new LODNode(worldBox.clone());
        } else {
            this.world.root.box.union(worldBox);
        }

        // Clone for physics (detached from scene graph parent)
        const physicsClone = new THREE.Mesh(mesh.geometry.clone());
        mesh.getWorldPosition(physicsClone.position);
        mesh.getWorldQuaternion(physicsClone.quaternion);
        mesh.getWorldScale(physicsClone.scale);
        physicsClone.updateMatrix();
        physicsClone.updateMatrixWorld(true);
        
        physicsClone.userData = { ...mesh.userData, visualReference: mesh };

        // Create Satellite Octree (Immediate Raycasting)
        const satGeo = mesh.geometry.clone();
        const satClone = new THREE.Mesh(satGeo);
        satClone.copy(physicsClone); 
        satClone.updateMatrix();
        satClone.updateMatrixWorld(true);
        satClone.userData = { ...mesh.userData, visualReference: mesh };

        const tempGroup = new THREE.Group();
        tempGroup.add(satClone);

        const satelliteOctree = new AwtsmoosOctree(worldBox.clone().expandByScalar(0.05));
        satelliteOctree._isManaged = true; 
        satelliteOctree.fromGraphNode(tempGroup);
        satelliteOctree.build(); 
        
        satelliteOctree.creationTime = performance.now();
        satelliteOctree.sourceMesh = mesh;

        this.world.pendingOctrees.push(satelliteOctree);

        // Insert into Main World
        physicsClone.userData.inMainWorld = true; 
        this.insertMeshOnly(this.world.root, physicsClone, worldBox);

        return true;
    },

    fromGraphNode(group) {
        if (!group) return;
        
        group.updateMatrixWorld(true);
        const groupBox = new THREE.Box3().setFromObject(group);
        if (groupBox.isEmpty() || isNaN(groupBox.min.x)) return;

        if (!this.world.root) {
            this.world.root = new LODNode(groupBox.clone());
        } else {
            this.world.root.box.union(groupBox);
        }

        // Add to processing queue
        this.intakeQueue.push({ 
            group: group, 
            isStaticWorld: true 
        });

        // Create temporary satellites for instant collision
        const meshes = [];
        group.traverse(obj => {
            if (obj.isMesh && obj.geometry && !obj.userData.notSolid) {
                if (!isNaN(obj.position.x)) {
                     meshes.push(obj);
                }
            }
        });

        for (const mesh of meshes) {
            if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
            const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
            
            if (isNaN(worldBox.min.x)) continue;

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
            
            this.world.pendingOctrees.push(sat);
        }
    },

    removeMesh(mesh) {
        if (!this.world.root || !mesh) return;

        const visualRef = mesh.userData?.visualReference || mesh;

        const meshBox = new THREE.Box3().setFromObject(mesh);
        if(isNaN(meshBox.min.x)) return;

        const nodes = this.findLeafNodesInBox(this.world.root, meshBox);

        nodes.forEach(node => {
            if (node.physicsMeshGroup && node.physicsMeshGroup.children.includes(mesh)) {
                node.physicsMeshGroup.remove(mesh);
                if (node.physics) {
                    node.physics.removeMesh(mesh); 
                }
            }
        });

        // Remove from satellites
        this.world.pendingOctrees = this.world.pendingOctrees.filter(sat => {
            if (sat.sourceMesh === visualRef) {
                return false; 
            }
            return true; 
        });
    }
};