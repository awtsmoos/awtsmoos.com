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

    // Helper to create a quad (2 triangles)
    // Points must be in Counter-Clockwise order relative to the normal
    // p1: Bottom-Left, p2: Bottom-Right, p3: Top-Right, p4: Top-Left
    const addQuad = (p1, p2, p3, p4, normalObj) => {
        vertices.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z, p4.x, p4.y, p4.z);
        normals.push(normalObj.x, normalObj.y, normalObj.z, normalObj.x, normalObj.y, normalObj.z, normalObj.x, normalObj.y, normalObj.z, normalObj.x, normalObj.y, normalObj.z);

        // World-Space UV Mapping
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
    
    // Original Orientation: Stairs ascend towards -Z
    const startZ = halfD; 

    // --- Diagonal Slope Logic ---
    // The slope starts after the first step (to keep the base solid/flat)
    const slopeStartZ = startZ - stepDepth;
    const slopeEndZ = -halfD;
    const slopeStartY = startY;
    const slopeEndY = halfH - actualStepHeight;

    const getSlopeY = (z) => {
        if (z >= slopeStartZ) return startY; // Flat bottom for first step
        // Linear interpolation from slopeStart to slopeEnd
        const t = (slopeStartZ - z) / (slopeStartZ - slopeEndZ);
        return slopeStartY + t * (slopeEndY - slopeStartY);
    };

    for (let i = 0; i < numSteps; i++) {
        const yBot = startY + (i * actualStepHeight);
        const yTop = yBot + actualStepHeight;
        
        const zFront = startZ - (i * stepDepth);
        const zBack = zFront - stepDepth;

        // Calculate solid bottom Y positions
        const ySlopeFront = getSlopeY(zFront);
        const ySlopeBack = getSlopeY(zBack);

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

        // 3. Left Side (-X) - Solid
        // Vertices: BackBottom, FrontBottom, FrontTop, BackTop
        addQuad(
            {x: startX, y: ySlopeBack, z: zBack},  
            {x: startX, y: ySlopeFront, z: zFront}, 
            {x: startX, y: yTop, z: zFront},   
            {x: startX, y: yTop, z: zBack},    
            {x: -1, y: 0, z: 0}
        );

        // 4. Right Side (+X) - Solid
        // Vertices: FrontBottom, BackBottom, BackTop, FrontTop
        addQuad(
            {x: endX, y: ySlopeFront, z: zFront},   
            {x: endX, y: ySlopeBack, z: zBack},    
            {x: endX, y: yTop, z: zBack},      
            {x: endX, y: yTop, z: zFront},     
            {x: 1, y: 0, z: 0}
        );

        // 5. Bottom Slope (Facing Down/Diagonal)
        // Calculate normal for the slope
        const dy = ySlopeBack - ySlopeFront;
        const dz = zBack - zFront;
        const len = Math.sqrt(dy*dy + dz*dz);
        // Normal points roughly down (-Y) and slightly back (-Z)
        const ny = -Math.abs(dz / len); 
        const nz = -Math.abs(dy / len);

        // Vertices must be CCW when looking from underneath
        // BackLeft, BackRight, FrontRight, FrontLeft
        addQuad(
            {x: startX, y: ySlopeBack, z: zBack},
            {x: endX, y: ySlopeBack, z: zBack},
            {x: endX, y: ySlopeFront, z: zFront},
            {x: startX, y: ySlopeFront, z: zFront},
            {x: 0, y: ny, z: nz}
        );
    }

    // 6. Back Wall (Facing -Z)
    // Connects the top of the slope to the top step at the very back
    const backYBot = getSlopeY(-halfD);
    const backYTop = halfH;
    
    addQuad(
        {x: endX, y: backYBot, z: -halfD}, {x: startX, y: backYBot, z: -halfD},
        {x: startX, y: backYTop, z: -halfD}, {x: endX, y: backYTop, z: -halfD},
        {x: 0, y: 0, z: -1}
    );

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    
    // B"H: Essential for Physics Engine
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    
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