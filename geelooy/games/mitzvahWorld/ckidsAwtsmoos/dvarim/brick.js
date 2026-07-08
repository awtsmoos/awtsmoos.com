
/**
 * B"H
 * @file brick.js
 * A brick for building, can have any dimension and can be owned in inventory.
 */

import Tzomayach from "../chayim/tzomayach.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
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
    static stackSize = 1024;
    static isBuildable = true;

    // B"H: Value in Perutahs
    sellValue = 5; 

    constructor(op) {
	    // B"H - STEP 1: Determine dimensions first.
	    // Use dimensions from the options (op), or default to 1x1x1.
	    const dimensions = op.dimensions || { x: 1, y: 1, z: 1 };
	
	    // B"H - STEP 2: Create the golem object on the options BEFORE calling super.
	    op.golem = {
	        guf: { 
	            BoxGeometry: [
	                dimensions.x, 
	                dimensions.y, 
	                dimensions.z
	            ]
	        },
	        toyr: {
	            MeshLambertMaterial: {
	                color: "#a0522d",
	                map: "awtsmoosTex://brick" // B"H: Draws directly from the void of math!
	            }
	        },
	        textureRepeat: { x: dimensions.x, y: dimensions.y }
	    };
	   
	    // B"H - STEP 3: Now call super. The Domem constructor will find and use op.golem.
	    super(op);
	
	    // B"H - STEP 4: Set the instance property for reference.
	    this.dimensions = dimensions;
        if(op.sellValue) this.sellValue = op.sellValue;
	}
}
