
/**
 * B"H
 * @file container.js
 * Represents an item that can hold other items (Bag, Box, etc.)
 */

import Tzomayach from "../chayim/tzomayach.js";

export default class Container extends Tzomayach {
    type = "container";
    static itemName = "Container";
    static description = "Holds other items.";
    static icon = "📦"; // Default emoji icon
    static stackSize = 1;

    constructor(op) {
        if (!op.golem) {
            op.golem = {
                guf: { BoxGeometry: [0.4, 0.4, 0.4] },
                toyr: { MeshLambertMaterial: { color: "#8B4513" } }
            };
        }
        super(op);
        
        this.isContainer = true;
        
        // Initialize slots if not present
        if (!this.customData) this.customData = {};
        
        const size = op.slotCount || (this.customData.slots ? this.customData.slots.length : 8);
        
        if (!this.customData.slots) {
            this.customData.slots = new Array(size).fill(null);
        }
    }
}
