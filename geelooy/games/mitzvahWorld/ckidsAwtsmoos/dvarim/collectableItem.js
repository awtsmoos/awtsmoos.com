
// B"H
/**
 * CollectableItem - Objects that can be gathered into the inventory.
 * Now triggers visual "Sparks of Holiness" (Hebrew particles) on pickup.
 */
import Tzomayach from "../chayim/tzomayach.js";

export default class CollectableItem extends Tzomayach {
    constructor(op) {
        super(op);
        this.proximity = 0.7; // Default pickup range
        this.isSolid = false; // Usually not solid so you can walk through it
        
        // Default Logic
        this.on("nivraNeechnas", (nivra) => {
            // Only the player (Chossid) can pick things up
            if (nivra.type === 'chossid') {
                
                // B"H Visual Feedback: Release the Sparks!
                if (nivra.spawnHebrewParticles) {
                    nivra.spawnHebrewParticles(this.mesh.position, 12);
                }

                // Fire the 'collected' event
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
