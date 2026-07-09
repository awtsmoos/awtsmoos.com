
// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { NODE_STATE, CONFIG } from '../constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import LODNode from '../LODNode.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    _subdivide(node) {
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
        for(const meshToMove of meshesToMove) this._distributeMeshes(node, meshToMove);
        const foci = [{ position: this._lastUpdateCenter, velocity: new THREE.Vector3() }];
        node.children.forEach(child => this._assessAndQueueWork(child, foci));
    },

    _merge(node) {
        const meshesToCollect = [];
        const gather = (currentNode) => {
            if (currentNode.type === 'BRANCH') currentNode.children.forEach(gather);
            meshesToCollect.push(...currentNode.physicsMeshGroup.children);
            if (currentNode.physics) currentNode.physics.clear();
            this._buildQueue.delete(currentNode);
            this._subdivisionQueue.delete(currentNode);
            this._mergeQueue.delete(currentNode);
        };
        
        node.children.forEach(gather);
        node.children.length = 0; 
        node.type = 'LEAF';
        
        meshesToCollect.forEach(mesh => {
             if(!node.physicsMeshGroup.children.some(c => c === mesh || c.userData?.visualReference === mesh.userData?.visualReference)) {
                  node.physicsMeshGroup.add(mesh);
             }
        });
        
        node.state = node.physicsMeshGroup.children.length > 0 ? NODE_STATE.PENDING_BUILD : NODE_STATE.EMPTY;
    },

    _assessAndQueueWork(node, foci) {
        const center = node.box.getCenter(new THREE.Vector3());
        let highestPriority = 'MERGE';
        let detailLevel = Infinity;

        for (const focus of foci) {
            const dynamicBuildRadius = CONFIG.BASE_BUILD_RADIUS + (focus.velocity.length() * CONFIG.VELOCITY_LOOKAHEAD);
            const distSq = center.distanceToSquared(focus.position);
            if (distSq < dynamicBuildRadius * dynamicBuildRadius) {
                highestPriority = 'BUILD';
                detailLevel = Math.min(detailLevel, distSq); 
                break;
            }
        }

        if (highestPriority === 'BUILD') {
            if (node.type === 'BRANCH') { 
                node.children.forEach(child => this._assessAndQueueWork(child, foci));
            } else { 
                const nodeSizeSq = node.box.getSize(new THREE.Vector3()).lengthSq();
                if (detailLevel < nodeSizeSq * 4 && this._getNodeDepth(node) < CONFIG.MAX_DEPTH) {
                    this._subdivisionQueue.add(node);
                } else if (node.state === NODE_STATE.PENDING_BUILD) {
                    this._buildQueue.add(node);
                }
            }
        } else { 
            if (node.type === 'BRANCH' && center.distanceToSquared(this._lastUpdateCenter) > CONFIG.MERGE_RADIUS * CONFIG.MERGE_RADIUS) {
                this._mergeQueue.add(node);
            }
        }
    }
};
