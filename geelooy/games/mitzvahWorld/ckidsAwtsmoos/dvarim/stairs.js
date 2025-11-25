/**
 * B"H
 * @file stairs.js
 * A dynamic stairs block.
 * Registers "StairGeometry" with the GeometryManager.
 */

import Tzomayach from "../chayim/tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';
import GeometryManager from "../Olam/math/GeometryManager.js";

// --- 1. Define the Geometry Generator Function ---
function generateStairGeometry(width = 1, height = 1, depth = 1) {
    const stepHeight = 0.25;
    // Ensure at least one step
    const numSteps = Math.max(1, Math.round(height / stepHeight));
    const actualStepHeight = height / numSteps;
    const stepDepth = depth / numSteps;

    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    
    let vIdx = 0;

    const addQuad = (p1, p2, p3, p4, normalObj) => {
        vertices.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z, p4.x, p4.y, p4.z);
        normals.push(normalObj.x, normalObj.y, normalObj.z, normalObj.x, normalObj.y, normalObj.z, normalObj.x, normalObj.y, normalObj.z, normalObj.x, normalObj.y, normalObj.z);

        // World-Space UV Mapping
        // This ensures textures align perfectly with adjacent blocks
        if (Math.abs(normalObj.y) > 0.9) { // Top/Bottom
            uvs.push(p1.x, p1.z, p2.x, p2.z, p3.x, p3.z, p4.x, p4.z);
        } else if (Math.abs(normalObj.x) > 0.9) { // Sides
            uvs.push(p1.z, p1.y, p2.z, p2.y, p3.z, p3.y, p4.z, p4.y);
        } else { // Front/Back
            uvs.push(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
        }

        indices.push(vIdx, vIdx + 1, vIdx + 2, vIdx, vIdx + 2, vIdx + 3);
        vIdx += 4;
    };

    const halfW = width / 2;
    const halfH = height / 2;
    const halfD = depth / 2;

    const startX = -halfW, endX = halfW;
    const startY = -halfH;
    
    // Stairs ascend towards -Z (Forward) to match standard game expectations
    const startZ = halfD; // Front

    for (let i = 0; i < numSteps; i++) {
        const yBot = startY + (i * actualStepHeight);
        const yTop = yBot + actualStepHeight;
        
        // Calculate Z slice for this step
        // Step 0 is at front (halfD), moving back
        const zFront = startZ - (i * stepDepth);
        const zBack = zFront - stepDepth;

        // 1. Riser (Vertical, facing +Z)
        addQuad(
            {x: startX, y: yBot, z: zFront}, {x: endX, y: yBot, z: zFront},
            {x: endX, y: yTop, z: zFront}, {x: startX, y: yTop, z: zFront},
            {x: 0, y: 0, z: 1}
        );

        // 2. Tread (Horizontal, facing +Y)
        addQuad(
            {x: startX, y: yTop, z: zFront}, {x: endX, y: yTop, z: zFront},
            {x: endX, y: yTop, z: zBack}, {x: startX, y: yTop, z: zBack},
            {x: 0, y: 1, z: 0}
        );

        // 3. Left Side (-X)
        addQuad(
            {x: startX, y: yBot, z: zBack}, {x: startX, y: yBot, z: zFront},
            {x: startX, y: yTop, z: zFront}, {x: startX, y: yTop, z: zBack},
            {x: -1, y: 0, z: 0}
        );

        // 4. Right Side (+X)
        addQuad(
            {x: endX, y: yBot, z: zFront}, {x: endX, y: yBot, z: zBack},
            {x: endX, y: yTop, z: zBack}, {x: endX, y: yTop, z: zFront},
            {x: 1, y: 0, z: 0}
        );
    }

    // 5. Back Wall (Facing -Z)
    addQuad(
        {x: endX, y: startY, z: -halfD}, {x: startX, y: startY, z: -halfD},
        {x: startX, y: halfH, z: -halfD}, {x: endX, y: halfH, z: -halfD},
        {x: 0, y: 0, z: -1}
    );

    // 6. Bottom (Facing -Y)
    addQuad(
        {x: startX, y: startY, z: halfD}, {x: endX, y: startY, z: halfD},
        {x: endX, y: startY, z: -halfD}, {x: startX, y: startY, z: -halfD},
        {x: 0, y: -1, z: 0}
    );

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    
    return geometry;
}

// --- 2. Register it immediately ---
GeometryManager.register("StairGeometry", generateStairGeometry);


// --- 3. The Class Definition ---
export default class Stairs extends Tzomayach {
	dimensions = { x: 1, y: 1, z: 1 }
    type = "stairs";

    static itemName = "Stairs";
    static icon = "/games/mitzvahWorld/icons/items/brick.svg"; 
    static description = "Stairs to reach higher levels. Automatically adjusts steps.";
    static stackSize = 64;
    static isBuildable = true;
    constructor(op) {
	    const dimensions = op.dimensions || { x: 1, y: 1, z: 1 };
	
	    op.golem = {
	        guf: { 
                // B"H: Calls the registered generator
	            "StairGeometry": [ dimensions.x, dimensions.y, dimensions.z ]
	        },
	        toyr: {
	            MeshLambertMaterial: {
	                color: "#a0522d",
	                map: "awtsmoos://brickTexture"
	            }
	        },
	        textureRepeat: { x: 1, y: 1 } // 1:1 because geometry uses world units for UVs
	    };
	   
	    super(op);
	    this.dimensions = dimensions;
	}
}