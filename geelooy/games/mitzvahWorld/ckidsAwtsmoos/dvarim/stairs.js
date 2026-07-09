
/**
 * B"H
 * @file stairs.js
 * A dynamic stairs block.
 * Registers "StairGeometry" with the GeometryManager upon file load.
 */

import Tzomayach from "../chayim/tzomayach.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import GeometryManager from "../Olam/math/GeometryManager.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

// --- 1. Define the Geometry Generator Function ---
function generateStairGeometry(width = 1, height = 1, depth = 1) {
    const stepHeight = 0.25;
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

        if (Math.abs(normalObj.y) > 0.9) { 
            uvs.push(p1.x, p1.z, p2.x, p2.z, p3.x, p3.z, p4.x, p4.z);
        } else if (Math.abs(normalObj.x) > 0.9) { 
            uvs.push(p1.z, p1.y, p2.z, p2.y, p3.z, p3.y, p4.z, p4.y);
        } else { 
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
    const startZ = halfD; 

    const slopeStartZ = startZ - stepDepth;
    const slopeEndZ = -halfD;
    const slopeStartY = startY;
    const slopeEndY = halfH - actualStepHeight;

    const getSlopeY = (z) => {
        if (z >= slopeStartZ) return startY; 
        const t = (slopeStartZ - z) / (slopeStartZ - slopeEndZ);
        return slopeStartY + t * (slopeEndY - slopeStartY);
    };

    for (let i = 0; i < numSteps; i++) {
        const yBot = startY + (i * actualStepHeight);
        const yTop = yBot + actualStepHeight;
        
        const zFront = startZ - (i * stepDepth);
        const zBack = zFront - stepDepth;

        const ySlopeFront = getSlopeY(zFront);
        const ySlopeBack = getSlopeY(zBack);

        addQuad(
            {x: startX, y: yBot, z: zFront}, {x: endX, y: yBot, z: zFront},
            {x: endX, y: yTop, z: zFront}, {x: startX, y: yTop, z: zFront},
            {x: 0, y: 0, z: 1}
        );

        addQuad(
            {x: startX, y: yTop, z: zFront}, {x: endX, y: yTop, z: zFront},
            {x: endX, y: yTop, z: zBack}, {x: startX, y: yTop, z: zBack},
            {x: 0, y: 1, z: 0}
        );

        addQuad(
            {x: startX, y: ySlopeBack, z: zBack},  
            {x: startX, y: ySlopeFront, z: zFront}, 
            {x: startX, y: yTop, z: zFront},   
            {x: startX, y: yTop, z: zBack},    
            {x: -1, y: 0, z: 0}
        );

        addQuad(
            {x: endX, y: ySlopeFront, z: zFront},   
            {x: endX, y: ySlopeBack, z: zBack},    
            {x: endX, y: yTop, z: zBack},      
            {x: endX, y: yTop, z: zFront},     
            {x: 1, y: 0, z: 0}
        );

        const dy = ySlopeBack - ySlopeFront;
        const dz = zBack - zFront;
        const len = Math.sqrt(dy*dy + dz*dz);
        const ny = -Math.abs(dz / len); 
        const nz = -Math.abs(dy / len);

        addQuad(
            {x: startX, y: ySlopeBack, z: zBack},
            {x: endX, y: ySlopeBack, z: zBack},
            {x: endX, y: ySlopeFront, z: zFront},
            {x: startX, y: ySlopeFront, z: zFront},
            {x: 0, y: ny, z: nz}
        );
    }

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
	            "StairGeometry": [ dimensions.x, dimensions.y, dimensions.z ]
	        },
	        toyr: {
	            MeshLambertMaterial: {
	                color: "#a0522d",
	                map: "awtsmoosTex://brick" // B"H: Pure math texture!
	            }
	        },
	        textureRepeat: { x: 1, y: 1 } 
	    };
	   
	    super(op);
	    this.dimensions = dimensions;
	}
}
