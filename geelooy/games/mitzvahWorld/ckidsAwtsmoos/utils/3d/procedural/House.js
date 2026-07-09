
/**
 * B"H
 * @module House
 * @description
 * The dwelling place in the lower realms (Dirah Betachtonim). 
 * This intense procedural generator takes raw measurements and carves out a hollow sanctuary. 
 * It traces the foundation, extrudes the walls up towards the heavens, leaves an opening 
 * for the soul to enter, and caps it with a protective pitched roof. 
 * Formed from absolute nothingness into a physical mesh.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class House {
    /**
     * @function generate
     * @description The Divine architecture function. Extrudes a building from mathematical definitions.
     * @param {number} width - The total width of the sanctuary.
     * @param {number} height - The elevation of the walls.
     * @param {number} depth - The depth of the structure.
     * @param {number} t - The thickness of the walls (the boundary between inner and outer).
     * @param {number} dw - The width of the entrance.
     * @param {number} dh - The height of the entrance.
     * @returns {THREE.BufferGeometry} A single unified mesh geometry containing walls, lintel, and roof.
     */
    static generate(width=14, height=8, depth=14, t=1, dw=3.5, dh=5.5) {
        const shape = new THREE.Shape();
        const w2 = width / 2;
        const d2 = depth / 2;
        const dw2 = dw / 2;

        // --- 1. Outline the Foundation (Outer Walls) ---
        // Drawing the boundary separating the holy from the mundane
        shape.moveTo(-dw2, -d2); 
        shape.lineTo(-w2, -d2);  
        shape.lineTo(-w2, d2);   
        shape.lineTo(w2, d2);    
        shape.lineTo(w2, -d2);   
        shape.lineTo(dw2, -d2);  

        // --- 2. Carve the Interior Space (Inner Walls) ---
        // Leaving room for the light to dwell within
        shape.lineTo(dw2, -d2 + t);
        shape.lineTo(w2 - t, -d2 + t);
        shape.lineTo(w2 - t, d2 - t);
        shape.lineTo(-w2 + t, d2 - t);
        shape.lineTo(-w2 + t, -d2 + t);
        shape.lineTo(-dw2, -d2 + t);
        shape.lineTo(-dw2, -d2); // The loop is sealed!

        // --- 3. EXTRUSION (Elevation into 3D) ---
        const extrudeSettings = { depth: height, bevelEnabled: false };
        const wallsGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        
        // Reorienting the extrusion from Z-axis to Y-axis (standing upright)
        wallsGeo.rotateX(Math.PI / 2);
        wallsGeo.translate(0, height, 0);

        // --- 4. The Lintel (Bridging the Gap) ---
        // The beam resting above the entrance
        const lintelH = height - dh;
        let lintelGeo = new THREE.BoxGeometry(0,0,0);
        if (lintelH > 0) {
            lintelGeo = new THREE.BoxGeometry(dw, lintelH, t);
            lintelGeo.translate(0, dh + (lintelH / 2), -d2 + (t / 2));
        }

        // --- 5. The Roof (Ascension) ---
        // A pitched roof reaching a singular point, symbolizing Unity
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-w2 - 1.5, 0); 
        roofShape.lineTo(0, height * 0.6); 
        roofShape.lineTo(w2 + 1.5, 0); 
        
        const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: depth + 3, bevelEnabled: false });
        roofGeo.translate(0, 0, -(depth + 3) / 2); 
        roofGeo.translate(0, height, 0); 

        // --- 6. Unification ---
        const houseGeo = BufferGeometryUtils.mergeGeometries([wallsGeo, lintelGeo, roofGeo]);
        houseGeo.computeBoundingBox();
        houseGeo.computeVertexNormals();

        // --- 7. UV Mapping (Wrapping the Vessel) ---
        const pos = houseGeo.attributes.position;
        const uvs = [];
        for (let i = 0; i < pos.count; i++) {
            const px = pos.getX(i);
            const py = pos.getY(i);
            const pz = pos.getZ(i);
            // Planar projection to allow the generated stone texture to wrap around
            uvs.push((px + pz) * 0.2, py * 0.2);
        }
        houseGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

        return houseGeo;
    }
}
