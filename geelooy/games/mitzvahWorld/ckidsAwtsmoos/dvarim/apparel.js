//B"H
/**
 * B"H
 * @file apparel.js
 * In the Kabbalistic tapestry of creation, Apparel is not mere fabric, but a "Levush" (garment) for the soul's expression in the world.
 * It is a vessel that both conceals and reveals the light within, an interface between the inner essence and the outer reality.
 * This class represents items that can be worn.
 */

import Tzomayach from "../chayim/tzomayach.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class Apparel extends Tzomayach {
    type = "apparel";
    
    static itemName = "Apparel";
    static description = "A garment that can be worn.";
    static stackSize = 1; // Apparel doesn't stack

    constructor(op) {
        // B"H: The Levushim now carry spiritual attributes
        this.chochmah = op.chochmah || 0;
        this.binah = op.binah || 0;
        this.daas = op.daas || 0;
        this.defense = op.defense || 0;
        this.attack = op.attack || 0;

        // If an apparel item is ever dropped in the world, it needs a default physical shape (golem).
        if (!op.golem) {
            op.golem = {
                guf: { BoxGeometry: [0.5, 0.5, 0.1] }, // A flat shape
                toyr: { MeshLambertMaterial: { color: op.color || "#333333" } } 
            };
        }
        
        super(op);
    }
}