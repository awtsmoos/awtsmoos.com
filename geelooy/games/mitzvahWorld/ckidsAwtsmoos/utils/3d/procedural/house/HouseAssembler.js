
// B"H
/**
 * @module HouseAssembler
 * @description
 * Carves the internal void and raises the outer walls of the Sanctuary.
 * Formed entirely from pure mathematical coordinate manipulation.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';
import WallBuilder from "./WallBuilder.js";
import RoofBuilder from "./RoofBuilder.js";

export default class HouseAssembler {
    static generate(width = 14, height = 8, depth = 14, thickness = 1, doorW = 4, doorH = 5.5) {
        return HouseAssembler.generateFromBlueprint({
            width, height, depth, wallThickness: thickness,
            entrances: [{ wall: 'front', width: doorW, height: doorH, offset: 0 }]
        });
    }

    static generateFromBlueprint(blueprint) {
        try {
            console.log("B\"H - ⚡ Compiling House Geometry Data...", blueprint);
            
            const walls = WallBuilder.build(blueprint);
            const roofs = RoofBuilder.build(blueprint);
            
            let mergedWalls = null;
            if(walls.length > 0) mergedWalls = BufferGeometryUtils.mergeGeometries(walls, false);
            let mergedRoofs = null;
            if(roofs.length > 0) mergedRoofs = BufferGeometryUtils.mergeGeometries(roofs, false);
            
            const finalParts = [];
            
            if(mergedWalls) {
                 const wc = mergedWalls.index ? mergedWalls.index.count : mergedWalls.attributes.position.count;
                 mergedWalls.clearGroups(); 
                 mergedWalls.addGroup(0, wc, 0); 
                 finalParts.push(mergedWalls);
            }
            if(mergedRoofs) {
                 const rc = mergedRoofs.index ? mergedRoofs.index.count : mergedRoofs.attributes.position.count;
                 mergedRoofs.clearGroups(); 
                 mergedRoofs.addGroup(0, rc, 1); 
                 finalParts.push(mergedRoofs);
            }
            
            if (finalParts.length === 0) return new THREE.BoxGeometry(1,1,1);
            
            const houseGeo = BufferGeometryUtils.mergeGeometries(finalParts, true);
            
            if (!houseGeo.attributes.normal) houseGeo.computeVertexNormals();

            const pos = houseGeo.attributes.position;
            if (!houseGeo.attributes.uv) {
                houseGeo.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(pos.count * 2).fill(0), 2));
            }
            
            HouseAssembler.applyBoxUVs(houseGeo);

            houseGeo.computeBoundingBox();

            console.log("B\"H - ⚡ House Compilation Successful. Ready to serve!");
            return houseGeo;
        } catch(e) {
            console.error("B\"H - ⚡ House Assembler Paradigm Shift Failed:", e);
            return new THREE.BoxGeometry(1,1,1);
        }
    }
    
    static applyBoxUVs(geometry) {
        const pos = geometry.attributes.position;
        const norm = geometry.attributes.normal; 
        const uvs = geometry.attributes.uv;
        const scale = 0.25; 
        
        for (let i = 0; i < pos.count; i++) {
            const nx = Math.abs(norm.getX(i));
            const ny = Math.abs(norm.getY(i));
            const nz = Math.abs(norm.getZ(i));
            
            const px = pos.getX(i);
            const py = pos.getY(i);
            const pz = pos.getZ(i);
            
            if (ny > nx && ny > nz) {
                uvs.setXY(i, px * scale, pz * scale);
            } else if (nz > nx && nz > ny) {
                uvs.setXY(i, px * scale, py * scale);
            } else {
                uvs.setXY(i, pz * scale, py * scale);
            }
        }
    }
}
