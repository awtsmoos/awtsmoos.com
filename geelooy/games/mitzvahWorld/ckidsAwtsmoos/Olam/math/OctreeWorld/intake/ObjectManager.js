
// B"H
/**
 * @file ObjectManager.js
 * @description
 * ⚖️ CHAPTER 13: THE JUSTICE OF MASS (GEVURAH) ⚖️
 * 
 * Chapter 131: Validating the Form.
 * When a mesh enters the Octree, it must present its credentials (coordinates and scale).
 * We add extreme logging to expose the magnitude of new world objects, proving 
 * that the floor is indeed as massive as the speech intended.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import LODNode from "../LODNode.js";
import { Octree as AwtsmoosOctree } from "../../AwtsmoosOctree/index.js";

export default {
    /**
     * @method addObject
     * @description Injects a physical mesh into the static Octree universe.
     */
    addObject(mesh) {
        if (!mesh) return false;

        mesh.updateMatrixWorld(true);
        
        // 1. ANALYZING THE SPATIAL DNA
        const p = mesh.position;
        const s = mesh.scale;
        
        if (isNaN(p.x) || isNaN(p.y) || isNaN(p.z)) {
            console.warn(`B"H - 🆘 REJECTED: Mesh [${mesh.name}] has NaN position! Reality is broken.`);
            return false;
        }

        // B"H: Confirm geometry exists before calculation
        if (!mesh.geometry) {
            console.error(`B"H - 🆘 ERROR: Mesh [${mesh.name}] is a formless void (no geometry).`);
            return false;
        }

        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);

        if (isNaN(worldBox.min.x) || isNaN(worldBox.max.x)) {
             console.warn(`B"H - 🆘 REJECTED: Bounding calculation yielded NaN for [${mesh.name}].`);
             return false;
        }

        const size = new THREE.Vector3();
        worldBox.getSize(size);
        
        // EXTREME DATA REVELATION:
        // B"H: silent


        // 2. ROOT ALIGNMENT
        if (!this.world.root) {
            this.world.root = new LODNode(worldBox.clone());
        } else {
            this.world.root.box.union(worldBox);
        }

        // 3. PHYSICAL CLONING
        const physicsClone = new THREE.Mesh(mesh.geometry.clone());
        mesh.getWorldPosition(physicsClone.position);
        mesh.getWorldQuaternion(physicsClone.quaternion);
        mesh.getWorldScale(physicsClone.scale);
        physicsClone.updateMatrix();
        physicsClone.updateMatrixWorld(true);
        physicsClone.userData = { ...mesh.userData, visualReference: mesh };

        // 4. INSTANT SATELLITE (RAYCASTING SPEED)
        // Creating an immediate sub-octree for fast local response while the world builds.
        const tempGroup = new THREE.Group();
        tempGroup.add(physicsClone.clone());

        const satelliteOctree = new AwtsmoosOctree(worldBox.clone().expandByScalar(0.1));
        satelliteOctree._isManaged = true; 
        satelliteOctree.fromGraphNode(tempGroup);
        satelliteOctree.build(); 
        
        satelliteOctree.creationTime = performance.now();
        satelliteOctree.sourceMesh = mesh;
        this.world.pendingOctrees.push(satelliteOctree);

        // 5. INSERTION INTO WORLD HIERARCHY
        physicsClone.userData.inMainWorld = true; 
        const placed = this.insertMeshOnly(this.world.root, physicsClone, worldBox);
        
        if (placed) {
            // B"H: silent

        }
        return placed;
    },

    /**
     * @method fromGraphNode
     * @description Ingests an entire hierarchy (usually world maps).
     */
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

        // 1. QUEUE FOR DETAILED BACKGROUND BUILDING
        this.intakeQueue.push({ group: group, isStaticWorld: true });

        // 2. IMMEDIATE INDIVIDUAL SATELLITE MANIFESTATION
        // Recursively finding solid meshes for instant collision support.
        const meshes = [];
        group.traverse(obj => {
            if (obj.isMesh && obj.geometry && !obj.userData.notSolid) {
                if (!isNaN(obj.position.x)) meshes.push(obj);
            }
        });

        for (const mesh of meshes) {
            this.addObject(mesh);
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
                if (node.physics) node.physics.removeMesh(mesh); 
            }
        });

        this.world.pendingOctrees = this.world.pendingOctrees.filter(sat => (sat.sourceMesh !== visualRef));
    }
};
