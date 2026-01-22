// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import OctreeIntake from './OctreeIntake.js';
import OctreeQuery from './OctreeQuery.js';
import OctreeBuilder from './OctreeBuilder.js';

/**
 * OctreeWorld - The master coordinator of physical existence.
 * Orchestrates the intake of new matter, the background construction of collision trees,
 * and the querying of spatial intersections.
 */
export class OctreeWorld {
    root = null;
    pendingOctrees = [];
    
    safeRadiusSq = 400; // The threshold before a re-evaluation of the LOD is triggered
    lastUpdateCenter = new THREE.Vector3(Infinity, Infinity, Infinity);

    constructor() {
        this.builder = new OctreeBuilder(this);
        this.intake = new OctreeIntake(this);
        this.query = new OctreeQuery(this);
    }
    
    /**
     * isProcessing - Checks if the world is still in the process of manifesting its physical form.
     */
    get isProcessing() {
        return this.intake.isProcessing;
    }

    /**
     * update - Pulses the world based on focal points (usually the player).
     * @param {Array|THREE.Vector3} focus - The points of interest.
     * @param {THREE.Vector3} velocity - Optional velocity for lookahead logic.
     */
    update(focus, velocity) {
        // B"H: Always process queues to allow background jobs to flow
        this.intake.processQueues(); 

        const foci = Array.isArray(focus) ? focus : [{ position: focus, velocity }];
        if (foci.length === 0) return;
        
        // Check if we moved far enough to trigger a shift in the LOD bubble
        const needsUpdate = foci.some(f => f.position.distanceToSquared(this.lastUpdateCenter) > this.safeRadiusSq);

        if (!needsUpdate) {
            this.intake.processQueues();
            return;
        }

        // Re-center the update bubble to the average focus point
        this.lastUpdateCenter.set(0, 0, 0);
        foci.forEach(f => this.lastUpdateCenter.add(f.position));
        this.lastUpdateCenter.divideScalar(foci.length);

        // Analyze Level of Detail: Subdivide nodes close to the focus, merge those far away
        this.intake.assessAndQueueWork(foci);

        this.intake.processQueues();
        
        // Cleanup Satellite Physics: Temporary octrees created for instant interaction on load
        if (this.pendingOctrees.length > 0) {
            const now = performance.now();
            this.pendingOctrees = this.pendingOctrees.filter(sat => {
                 // Keep satellites alive for at least 3 seconds to cover load times
                 if (now - sat.creationTime < 3000) return true;
                 
                 // If the main world node at this position is READY, the satellite can be released
                 const center = sat.box.getCenter(new THREE.Vector3());
                 const mainNode = this.intake.findLeafNodeAtPoint(this.root, center);
                 if (mainNode && mainNode.state === 'READY') {
                     return false; 
                 }
                 return true; 
            });
        }
    }

    // --- Interaction Interfaces ---
    rayIntersect(ray) { return this.query.rayIntersect(ray); }
    capsuleIntersect(capsule) { return this.query.capsuleIntersect(capsule); }
    addObject(mesh) { return this.intake.addObject(mesh); }
    removeMesh(mesh) { return this.intake.removeMesh(mesh); }
    fromGraphNode(group) { return this.intake.fromGraphNode(group); }
}
