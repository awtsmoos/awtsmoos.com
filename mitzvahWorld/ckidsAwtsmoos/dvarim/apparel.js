//B"H
/**
 * B"H
 * @file apparel.js
 * In the Kabbalistic tapestry of creation, Apparel is not mere fabric, but a "Levush" (garment) for the soul's expression in the world.
 * It is a vessel that both conceals and reveals the light within, an interface between the inner essence and the outer reality.
 * This class represents items that can be worn.
 */

import Tzomayach from "../chayim/tzomayach.js";

export default class Apparel extends Tzomayach {
    type = "apparel";
    
    static itemName = "Apparel";
    static description = "A garment that can be worn.";
    static stackSize = 1; // Apparel doesn't stack

    constructor(op) {
        // If an apparel item is ever dropped in the world, it needs a default physical shape (golem).
        if (!op.golem) {
            op.golem = {
                guf: { BoxGeometry: [0.5, 0.5, 0.1] }, // A flat shape
                toyr: { MeshLambertMaterial: { color: "#333333" } } 
            };
        }
        
        super(op);
    }
}