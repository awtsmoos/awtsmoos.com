
// B"H
import * as THREE  from '/games/scripts/build/three.module.js';
// B"H: Updated Import
import { Octree as AwtsmoosOctree } from '../AwtsmoosOctree/index.js';

import builderMethods from "./methods/builder.js";
import traversalMethods from "./methods/traversal.js";

const NODE_STATE = {
    EMPTY: 'EMPTY',             
    PENDING_BUILD: 'PENDING_BUILD', 
    READY: 'READY'              
};

class LODNode {
    box;
    children = [];
    type = 'LEAF';
    state = NODE_STATE.EMPTY;
    physics = null;
    physicsMeshGroup = new THREE.Group();
    constructor(box) { this.box = box; }
}

export class OctreeWorld {
    constructor() {
        this._root = null;
        this._intakeQueue = [];
        this._buildQueue = new Set();
        this._subdivisionQueue = new Set();
        this._mergeQueue = new Set();
        this._pendingOctrees = []; 

        this._safeRadiusSq = 400; 
        this._baseBuildRadius = 60;
        this._mergeRadius = 120;
        this._velocityLookaheadFactor = 2.0;
        
        this._lastUpdateCenter = new THREE.Vector3(Infinity, Infinity, Infinity);
        this._activeJob = null; 
        this._conversionQueue = []; 
        
        // Reference to class needed for instantiation in modules
        this.AwtsmoosOctreeClass = AwtsmoosOctree;
    }

    createNode(box) {
        return new LODNode(box);
    }

    get isProcessing() {
        return this._intakeQueue.length > 0 || this._buildQueue.size > 0 || this._activeJob !== null;
    }
    
    // Core update loop
    update(focus, velocity) {
        if (!this._root) return;
        this.processIntakeQueue();

        const foci = Array.isArray(focus) ? focus : [{ position: focus, velocity }];
        if (foci.length === 0) return;

        const needsUpdate = foci.some(f => f.position.distanceToSquared(this._lastUpdateCenter) > this._safeRadiusSq);
        
        if (!needsUpdate) {
            this._processQueues(); 
            return;
        }

        this._lastUpdateCenter.set(0, 0, 0);
        foci.forEach(f => this._lastUpdateCenter.add(f.position));
        this._lastUpdateCenter.divideScalar(foci.length);

        this._enforceCriticalPath(foci);
        this._assessAndQueueWork(this._root, foci);
        this._processQueues();
    }
    
    fromGraphNode(group) {
        if (!group) return;
        group.updateMatrixWorld(true);
        const groupBox = new THREE.Box3().setFromObject(group);
        if (groupBox.isEmpty()) return;

        if (!this._root) {
            this._root = new LODNode(groupBox.clone());
        } else {
            this._root.box.union(groupBox);
        }

        this._intakeQueue.push({ 
            group: group, 
            isStaticWorld: true 
        });
    }

    removeMesh(mesh) {
        if (!this._root || !mesh) return;

        const visualRef = mesh.userData?.visualReference || mesh;
        const meshBox = new THREE.Box3().setFromObject(mesh);
        const nodes = this._findLeafNodesInBox(this._root, meshBox);

        nodes.forEach(node => {
            if (node.physicsMeshGroup && node.physicsMeshGroup.children.includes(mesh)) {
                node.physicsMeshGroup.remove(mesh);
                if (node.physics) {
                    node.physics.removeMesh(mesh); 
                }
            }
        });

        this._pendingOctrees = this._pendingOctrees.filter(sat => {
            if (sat.sourceMesh === visualRef) {
                return false; 
            }
            return true; 
        });
    }
}

// B"H: Mixin
Object.assign(OctreeWorld.prototype, builderMethods);
Object.assign(OctreeWorld.prototype, traversalMethods);
