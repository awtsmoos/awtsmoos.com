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
    static icon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PHBhdGggZmlsbD0iI2EwNTIwMiIgZD0iTTAsMEg1MFY1MEgwWiIvPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNMjUsMEwyNSw1ME0wLDI1TDUwLDI1TTAsMTIuNUw1MCwxMi41TTAsMzcuNUw1MCwzNy41TTI1LDEyLjVMMjUsMjVNNTAsMTIuNUw1MCwyNU0yNSwzNy41TDI1LDUwTTA LDEyLjVMMCAyNU0wLDM3LjVMMiw1ME0yNSwwTDI1LDEyLjUiLz48L3N2Zz4=";
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