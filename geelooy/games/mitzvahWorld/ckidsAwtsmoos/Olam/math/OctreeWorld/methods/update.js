
// B"H
/**
 * @module OctreeWorld_Update
 * @description
 * 🌊 THE RHYTHM OF EXISTENCE 🌊
 * 
 * Chapter 1: The Constant Renewal.
 * Reality is not static; it is a stream of information constantly refreshed 
 * by the Awtsmoos. This module is the pulse of the Octree system. It:
 * 1. Ingests new meshes that entered the world.
 * 2. Monitors the player's position and velocity.
 * 3. Enforces solidity in the direction of the player's intent.
 * 4. Merges or subdivides space based on proximity.
 */
import { CONFIG } from '../constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    /**
     * @method update
     * @description Maintains the physical grid relative to a point of focus.
     * @param {THREE.Vector3|Array} focus - Usually the player's world position.
     * @param {THREE.Vector3} velocity - The direction and force of movement.
     */
    update(focus, velocity) {
        if (!this.root) return;
        
        // Periodically ingest anything waiting in the entrance queue
        this._processIntakeQueue();

        const foci = Array.isArray(focus) ? focus : [{ position: focus, velocity }];
        if (foci.length === 0 || !foci[0].position) return;

        // Optimization: Only re-assess the universe if the focus has moved significantly
        const needsUpdate = foci.some(f => f.position.distanceToSquared(this._lastUpdateCenter) > CONFIG.SAFE_RADIUS_SQ);
        
        if (!needsUpdate) {
            // Even when stationary, we process a tiny slice of background building work
            this._processQueues(); 
            return;
        }

        // Re-calculate the collective center of attention
        this._lastUpdateCenter.set(0, 0, 0);
        foci.forEach(f => this._lastUpdateCenter.add(f.position));
        this._lastUpdateCenter.divideScalar(foci.length);

        // B"H: THE CRITICAL PATH
        // Immediately solidify the ground directly in the path of travel
        this._enforceCriticalPath(foci);
        
        // Assess which quadrants of space need more detail (Subdivision) or less (Merging)
        this._assessAndQueueWork(this.root, foci);
        
        // Execute a slice of the pending tasks
        this._processQueues();
    }
};
