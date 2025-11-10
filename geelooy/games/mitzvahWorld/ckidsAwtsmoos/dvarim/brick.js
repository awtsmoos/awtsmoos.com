/**
 * B"H
 * @file brick.js
 * A brick for building, can have any dimension and can be owned in inventory.
 */

import Tzomayach from "../chayim/tzomayach.js";
export default class Brick extends Tzomayach {
	dimensions = {
		x: 1,
		y: 1,
		z: 1
	}
    
    type= "brick";

    // Static properties for inventory management
    static itemName = "Brick";
    static icon = "/games/mitzvahWorld/icons/items/brick.svg";
    static description = "A sturdy 1x1x1 building brick. Use it to build structures.";
    static stackSize = 64;
    
    constructor(op) {
        
        op.golem = {
            guf: { 
                BoxGeometry: [1, 1, 1]
            },
            toyr: {
                MeshLambertMaterial: { color: "#a0522d" } // A more brick-like Sienna color
            }
        };
       
        super(op);
    }
}