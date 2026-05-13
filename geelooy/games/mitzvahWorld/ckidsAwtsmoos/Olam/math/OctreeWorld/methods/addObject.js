
// B"H
/**
 * @module OctreeWorld_AddObject
 * @description
 * 🧱 THE SACRED SOLIDIFICATION OF FORM 🧱
 * 
 * ==============================================================================
 * 👻 EXPLANATION OF GHOST COLLISIONS 👻
 * ==============================================================================
 * A 'Ghost Collision' occurs when the Physics Mesh (the mathematical boundary 
 * in the Octree) is disconnected from the Visual Mesh (what the eye sees).
 * 
 * 1. THE ORIGIN GHOST: If a mesh is added to the Octree BEFORE its world matrix 
 * (position, rotation, scale) is updated, the Octree records its triangles exactly 
 * at the origin [0,0,0]. Later, the visual mesh is moved, but its 'Ghost' remains 
 * at the origin, creating invisible walls. We fix this by forcing `updateMatrixWorld(true)`
 * BEFORE Octree insertion.
 * 
 * 2. THE EMBEDDED SPAWN: If a player (capsule) is spawned at Y=0, and the floor 
 * is also at Y=0, the bottom half of the player's capsule is instantly submerged 
 * INSIDE the solid floor. The physics engine violently ejects them, causing erratic 
 * bouncing and teleportation. We fix this by dropping the player from a safe altitude!
 * ==============================================================================
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { Octree as AwtsmoosOctree } from "../../AwtsmoosOctree/index.js";
import LODNode from '../LODNode.js';

export default {
    addObject(mesh) {
        if (!mesh || !mesh.geometry) return false;
        
        // 1. THE ABSOLUTE REVELATION OF COORDINATES
        mesh.updateMatrixWorld(true);
        
        // B"H: THE PURIFICATION OF THE MATRIX
        const elements = mesh.matrixWorld.elements;
        for (let i = 0; i < 16; i++) {
            if (isNaN(elements[i])) {
                console.warn(`B"H - 🚨 Mesh [${mesh.name}] has a corrupted matrix! Excluded from physics.`);
                return false;
            }
        }

        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        
        const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);

        // 2. EXPANDING THE CROWN (ROOT)
        if (!this.root) {
            this.root = new LODNode(worldBox.clone());
        } else {
            this.root.box.union(worldBox);
        }

        // 3. THE PHYSICS CLONE
        const physicsClone = new THREE.Mesh(mesh.geometry.clone());
        mesh.getWorldPosition(physicsClone.position);
        mesh.getWorldQuaternion(physicsClone.quaternion);
        mesh.getWorldScale(physicsClone.scale);
        physicsClone.updateMatrix();
        physicsClone.updateMatrixWorld(true);
        
        physicsClone.userData = { ...mesh.userData, visualReference: mesh };

        // B"H: EXTREME VISUAL DIAGNOSTICS FOR OCTREE
        // Projecting the ACTUAL edges of the physics boundary into the visible realm!
        if (this.olam && this.olam.scene) {
            const edges = new THREE.EdgesGeometry(physicsClone.geometry);
            const lineMat = new THREE.LineBasicMaterial({ 
                color: 0xff00ed, // Blazing Pink
                linewidth: 2,
                transparent: true,
                opacity: 0.8
            });
            const helperLines = new THREE.LineSegments(edges, lineMat);
            
            helperLines.position.copy(physicsClone.position);
            helperLines.quaternion.copy(physicsClone.quaternion);
            helperLines.scale.copy(physicsClone.scale);
            
            helperLines.updateMatrixWorld(true);
            
            // Attach to scene, but NEVER to Octree
            this.olam.scene.add(helperLines);
        }

        // 4. THE RAPID SATELLITE
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

        this._pendingOctrees.push(satelliteOctree);
        
        // 5. THE SEDER HISHTALSHELUS INTAKE
        physicsClone.userData.inMainWorld = true; 
        this._insertMeshOnly(this.root, physicsClone, worldBox);
        
        return true;
    }
};
