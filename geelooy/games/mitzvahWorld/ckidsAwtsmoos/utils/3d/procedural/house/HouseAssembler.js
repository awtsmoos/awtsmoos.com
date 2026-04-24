
/**
 * B"H
 * @module HouseAssembler
 * @description
 * Coordinates the WallBuilder and RoofBuilder. Merges their primitive shapes into one 
 * massive, immutable entity that perfectly supports internal hollow collision without normal issues.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';
import WallBuilder from "./WallBuilder.js";
import RoofBuilder from "./RoofBuilder.js";

export default class HouseAssembler {
    static generate(width = 14, height = 8, depth = 14, thickness = 1, doorW = 4, doorH = 5.5) {
        try {
            console.log("B\"H - ⚡ Forging Procedural House Entity...");
            
            const walls = WallBuilder.build(width, height, depth, thickness, doorW, doorH);
            const roofs = RoofBuilder.build(width, height, depth);
            
            const allParts = [...walls, ...roofs];
            
            if (allParts.length === 0) {
                throw new Error("No parts generated.");
            }

            const merged = BufferGeometryUtils.mergeGeometries(allParts);
            
            // Simple world-space UV mapping for textures
            const pos = merged.attributes.position;
            const uvs = [];
            for (let i = 0; i < pos.count; i++) {
                const px = pos.getX(i);
                const py = pos.getY(i);
                const pz = pos.getZ(i);
                // Basic planar wrap
                uvs.push((px + pz) * 0.2, py * 0.2);
            }
            merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

            merged.computeBoundingBox();
            merged.computeBoundingSphere();
            merged.computeVertexNormals();

            return merged;

        } catch (e) {
            console.error("B\"H - ⚡ HouseAssembler Catastrophic Failure. Returning safety box.", e);
            const emergencyBox = new THREE.BoxGeometry(width, height, depth);
            emergencyBox.translate(0, height/2, 0);
            return emergencyBox;
        }
    }
}
