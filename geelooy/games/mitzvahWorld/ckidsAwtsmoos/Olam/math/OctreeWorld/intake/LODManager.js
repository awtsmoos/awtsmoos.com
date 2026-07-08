
// B"H
/**
 * @file LODManager.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 14: The Preservation of the Coordinates (Netzach)            ║
 * ║                                                                          ║
 * ║  When the world is subdivided, a single physical vessel (mesh)         ║
 * ║  might exist across multiple spatial boundaries. To divide it, we      ║
 * ║  clone the vessel. However, a clone forgets its place in the world     ║
 * ║  (`matrixWorld` resets to Identity). We now forcefully copy the        ║
 * ║  absolute coordinates so the terrain does not collapse into the void.  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import LODNode from "../LODNode.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { NODE_STATE, MAX_DEPTH } from "../constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();

export default {
    assessAndQueueWork(node, foci) {
        if (Array.isArray(node)) {
            foci = node;
            node = this.world.root;
        }

        if (!node || !node.box) return;

        const center = node.box.getCenter(_v1);
        let highestPriority = 'MERGE';
        let detailLevel = Infinity;

        for (const focus of foci) {
            const dynamicBuildRadius = this.baseBuildRadius + (focus.velocity.length() * this.velocityLookaheadFactor);
            const distSq = center.distanceToSquared(focus.position);

            if (distSq < dynamicBuildRadius * dynamicBuildRadius) {
                highestPriority = 'BUILD';
                detailLevel = Math.min(detailLevel, distSq); 
                break;
            }
        }

        if (highestPriority === 'BUILD') {
            if (node.type === 'BRANCH') { 
                node.children.forEach(child => this.assessAndQueueWork(child, foci));
            } else { 
                const nodeSizeSq = node.box.getSize(_v2).lengthSq();
                if (detailLevel < nodeSizeSq * 4 && this.getNodeDepth(node) < MAX_DEPTH) {
                    this.subdivisionQueue.add(node);
                }
                else if (node.state === NODE_STATE.PENDING_BUILD) {
                    this.buildQueue.add(node);
                }
            }
        } else { 
            if (node.type === 'BRANCH' && center.distanceToSquared(this.lastUpdateCenter) > this.mergeRadius * this.mergeRadius) {
                this.mergeQueue.add(node);
            }
        }
    },
    
    subdivide(node) {
        if (node.type === 'BRANCH') return;

        node.type = 'BRANCH';
        if (node.physics) node.physics.clear();
        node.physics = null;
        node.state = NODE_STATE.EMPTY;

        const halfSize = node.box.getSize(new THREE.Vector3()).multiplyScalar(0.5);
        for (let i = 0; i < 8; i++) {
            const min = new THREE.Vector3(
                node.box.min.x + (i & 1 ? halfSize.x : 0),
                node.box.min.y + (i & 2 ? halfSize.y : 0),
                node.box.min.z + (i & 4 ? halfSize.z : 0)
            );
            node.children.push(new LODNode(new THREE.Box3(min, min.clone().add(halfSize))));
        }
        
        const meshesToMove = [...node.physicsMeshGroup.children];
        node.physicsMeshGroup.clear();

        for(const meshToMove of meshesToMove) {
             this.distributeMeshes(node, meshToMove);
        }

        const foci =[{ position: this.lastUpdateCenter, velocity: new THREE.Vector3() }];
        node.children.forEach(child => this.assessAndQueueWork(child, foci));
    },

    merge(node) {
        const meshesToCollect =[];

        const gather = (currentNode) => {
            if (currentNode.type === 'BRANCH') {
                currentNode.children.forEach(gather);
            }
            meshesToCollect.push(...currentNode.physicsMeshGroup.children);
            if (currentNode.physics) currentNode.physics.clear();
            
            this.buildQueue.delete(currentNode);
            this.subdivisionQueue.delete(currentNode);
            this.mergeQueue.delete(currentNode);
        };
        
        node.children.forEach(gather);
        node.children.length = 0; 
        node.type = 'LEAF';

        meshesToCollect.forEach(mesh => node.physicsMeshGroup.add(mesh));
        
        if (node.physicsMeshGroup.children.length > 0) {
            node.state = NODE_STATE.PENDING_BUILD;
        } else {
            node.state = NODE_STATE.EMPTY;
        }
    },

    distributeMeshes(node, mesh) {
        const meshWorldBox = new THREE.Box3().setFromObject(mesh);
        if (!node.box.intersectsBox(meshWorldBox)) return;

        if (node.type === 'LEAF') {
            node.physicsMeshGroup.add(mesh);
            node.state = NODE_STATE.PENDING_BUILD;
            return;
        }
        
        if (node.type === 'BRANCH') {
            const intersectingChildren = node.children.filter(child => child.box.intersectsBox(meshWorldBox));

            if (intersectingChildren.length === 1) {
                this.distributeMeshes(intersectingChildren[0], mesh);
            } else if (intersectingChildren.length > 1) {
                intersectingChildren.forEach(child => {
                    // B"H: CRITICAL FIX. The clone loses its world matrix. We must manually copy it!
                    const cMesh = mesh.clone();
                    cMesh.matrixWorld.copy(mesh.matrixWorld); 
                    this.distributeMeshes(child, cMesh);
                });
            }
        }
    }
};
