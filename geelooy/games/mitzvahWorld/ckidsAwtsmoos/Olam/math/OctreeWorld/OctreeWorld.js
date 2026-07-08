
// B"H
/**
 * @file OctreeWorld.js
 * @description
 * 🏰 THE TEMPLE OF FOUNDATIONS 🏰
 * 
 * Chapter 7: The Guard of the Pulse.
 * To prevent the world from freezing, we must only build a small portion 
 * of reality per frame. This is the Tzimtzum of processing time.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { Octree as AwtsmoosOctree } from "../AwtsmoosOctree/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { NODE_STATE, CONFIG } from './constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import LODNode from './LODNode.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import JobProcessor from './JobProcessor.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export class OctreeWorld {
    constructor() {
        this.root = null;
        this._intakeQueue = [];
        this._buildQueue = new Set();
        this._subdivisionQueue = new Set();
        this._mergeQueue = new Set();
        this._pendingOctrees = []; 
        this._lastUpdateCenter = new THREE.Vector3(Infinity, Infinity, Infinity);
        this.jobProcessor = new JobProcessor(this);
    }

    _buildNodePhysics(node) {
        if (!node || node.physicsMeshGroup.children.length === 0) return;
        const newPhysics = new AwtsmoosOctree(node.box.clone());
        newPhysics._isManaged = true;
        newPhysics.fromGraphNode(node.physicsMeshGroup);
        newPhysics.build();
        node.physics = newPhysics;
        node.state = NODE_STATE.READY;
    }

    _processQueues() {
        const startTime = performance.now();
        // B"H: ABSOLUTE TIME CAP. Prevents the walk-freeze!
        const FRAME_BUDGET = 5; // 5ms per frame

        while (this._intakeQueue.length > 0) {
            if (performance.now() - startTime > FRAME_BUDGET) return;
            const job = this._intakeQueue.shift();
            this.addObject(job.mesh || job); 
        }

        const buildIt = this._buildQueue.values();
        for (let node of buildIt) {
            if (performance.now() - startTime > FRAME_BUDGET) return;
            this._buildQueue.delete(node);
            this._buildNodePhysics(node);
        }

        const subIt = this._subdivisionQueue.values();
        for (let node of subIt) {
            if (performance.now() - startTime > FRAME_BUDGET) return;
            this._subdivisionQueue.delete(node);
            this._subdivide(node);
        }
    }

    // (Remaining methods like rayIntersect and capsuleIntersect stay established...)
    rayIntersect(ray) {
        let closestResult = null;
        if (!this.root) return null;
        const scan = (node) => {
            if (!ray.intersectsBox(node.box)) return;
            if (node.type === 'LEAF') {
                if (node.physics) {
                    const res = node.physics.rayIntersect(ray);
                    if (res && (!closestResult || res.distance < closestResult.distance)) closestResult = res;
                }
            } else node.children.forEach(scan);
        };
        scan(this.root);
        return closestResult;
    }

    update(focus, velocity) {
        if (!this.root) return;
        this._processQueues();
        const foci = Array.isArray(focus) ? focus : [{ position: focus, velocity }];
        if (foci.length === 0 || !foci[0].position) return;
        if (foci[0].position.distanceToSquared(this._lastUpdateCenter) > CONFIG.SAFE_RADIUS_SQ) {
            this._lastUpdateCenter.copy(foci[0].position);
            this._assessAndQueueWork(this.root, foci);
        }
    }

    addObject(mesh) {
        if (!mesh || !mesh.geometry) return false;
        mesh.updateMatrixWorld(true);
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
        if (!this.root) this.root = new LODNode(worldBox.clone());
        else this.root.box.union(worldBox);
        return this._insertMeshOnly(this.root, mesh, worldBox);
    }

    _insertMeshOnly(node, mesh, meshBox) {
        if (!node.box.intersectsBox(meshBox)) return false;
        if (node.type === 'LEAF') {
            node.physicsMeshGroup.add(mesh);
            node.state = NODE_STATE.PENDING_BUILD;
            this._buildQueue.add(node);
            return true;
        }
        let placed = false;
        for (const child of node.children) {
            if (this._insertMeshOnly(child, mesh, meshBox)) placed = true;
        }
        return placed;
    }
}
