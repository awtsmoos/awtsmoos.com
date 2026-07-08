
/**
 * B"H
 */

import Tzomayach from "../chayim/tzomayach.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class CollectableItem extends Tzomayach {
    constructor(op) {
        super(op);
        this.proximity = 0.7; // Default pickup range
        this.isSolid = false; // Usually not solid so you can walk through it
        
        // Default Logic
        this.on("nivraNeechnas", (nivra) => {
            // Only the player (Chossid) can pick things up
            if (nivra.type === 'chossid') {
                
                // Fire the 'collected' event
                // Pass 'this' (the item) and 'nivra' (the collector)
                this.ayshPeula("collected", this, nivra);
                
                // Remove from world
                this.olam.sealayk(this);
                
                // If it was part of a larger entity group, remove the parent entity too
                if(this.entityName && this.av) {
                    this.olam.sealayk(this.av);
                }
            }
        });
    }
}
