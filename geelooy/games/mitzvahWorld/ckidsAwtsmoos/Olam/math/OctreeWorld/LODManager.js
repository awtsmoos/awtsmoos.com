
/**
 * @file LODManager.js
 * @description
 * 📐 CHAPTER 14: THE MEASUREMENT OF DIMENSIONS 📐
 * 
 * Re-aligned the distribution mechanics. Corrected the matrix cloning 
 * logic so that subdivided world geometry perfectly matches the absolute 
 * coordinates of the parent world. No gaps, no slippage!
 */
import * as THREE from '/games/scripts/build/three.module.js';
import LODNode from "../LODNode.js";
import { NODE_STATE } from "../constants.js";

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();

export default {
    assessAndQueueWork(foci) {
        if (!this.world.root) return;
        this._recursiveAssess(this.world.root, foci);
    },

    _recursiveAssess(node, foci) {
        const center = node.box.getCenter(_v1);
        let targetState = 'MERGE';
        let minDistSq = Infinity;

        for (const focus of foci) {
            const distSq = center.distanceToSquared(focus.position);
            minDistSq = Math.min(minDistSq, distSq);
            
            if (distSq < this.baseBuildRadius * this.baseBuildRadius) {
                targetState = 'BUILD';
                break;
            }
        }

        if (targetState === 'BUILD') {
            if (node.type === 'BRANCH') {
                node.children.forEach(c => this._recursiveAssess(c, foci));
            } else {
                const sizeSq = node.box.getSize(_v2).lengthSq();
                // If focus is very close, subdivide further if not at MAX depth
                if (minDistSq < sizeSq * 2 && this.getNodeDepth(node) < 8) {
                    this.subdivisionQueue.add(node);
                } else if (node.state === NODE_STATE.PENDING_BUILD) {
                    this.buildQueue.add(node);
                }
            }
        } else if (node.type === 'BRANCH') {
            this.mergeQueue.add(node);
        }
    },
    
    subdivide(node) {
        if (node.type === 'BRANCH') return;
        node.type = 'BRANCH';
        node.state = NODE_STATE.EMPTY;

        const halfSize = node.box.getSize(_v2).multiplyScalar(0.5);
        for (let i = 0; i < 8; i++) {
            const min = new THREE.Vector3(
                node.box.min.x + (i & 1 ? halfSize.x : 0),
                node.box.min.y + (i & 2 ? halfSize.y : 0),
                node.box.min.z + (i & 4 ? halfSize.z : 0)
            );
            node.children.push(new LODNode(new THREE.Box3(min, min.clone().add(halfSize))));
        }
        
        const legacyMeshes = [...node.physicsMeshGroup.children];
        node.physicsMeshGroup.clear();

        legacyMeshes.forEach(mesh => this.distributeMeshes(node, mesh));
    },

    distributeMeshes(parentNode, mesh) {
        const meshBox = _v2; // Temporary box for check
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);

        if (parentNode.type === 'LEAF') {
            parentNode.physicsMeshGroup.add(mesh);
            parentNode.state = NODE_STATE.PENDING_BUILD;
            return;
        }

        parentNode.children.forEach(child => {
            if (child.box.intersectsBox(worldBox)) {
                // Clone to ensure mesh exists locally in multiple nodes
                const c = mesh.clone();
                c.matrixWorld.copy(mesh.matrixWorld);
                c.userData = { ...mesh.userData };
                this.distributeMeshes(child, c);
            }
        });
    },

    merge(node) {
        const collected = [];
        const gather = (n) => {
            if (n.type === 'BRANCH') n.children.forEach(gather);
            else collected.push(...n.physicsMeshGroup.children);
            if (n.physics) n.physics.clear();
        };
        
        node.children.forEach(gather);
        node.children.length = 0; 
        node.type = 'LEAF';

        collected.forEach(m => {
            if (!node.physicsMeshGroup.children.includes(m)) node.physicsMeshGroup.add(m);
        });
        node.state = node.physicsMeshGroup.children.length > 0 ? NODE_STATE.PENDING_BUILD : NODE_STATE.EMPTY;
    }
};
