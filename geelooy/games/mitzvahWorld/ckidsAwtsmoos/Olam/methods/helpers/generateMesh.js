
/**
 * @file generateMesh.js
 * @description
 * B"H
 * 🛠️ CHAPTER 15: THE FORGE OF TOTAL MANIFESTATION 🛠️
 * 
 * Chapter 15.1: The Emerald Decree
 * This module detects if a creation requests the 'AwtsmoosGrassMaterial' 
 * and applies the complex GLSL shader logic natively.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import GeometryCarver from './GeometryCarver.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import MaterialScribe from './MaterialScribe.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

export default async function generateThreeJsMesh(golem, olamContext) {
    const soulName = golem.name || golem.id || 'Procedural Spark';
    
    try {
        // --- 1. GEOMETRY ---
        const gufSchema = golem.guf || { "BoxGeometry": [1, 1, 1] };
        const [geoName, geoArgs] = Object.entries(gufSchema)[0];
        const geometry = GeometryCarver.carve(geoName, geoArgs);

        // --- 2. MATERIAL ---
        const toyrSchema = golem.toyr || { "MeshBasicMaterial": { color: "white" } };
        const [matName, matArgs] = Object.entries(toyrSchema)[0];
        
        let material;
        
        // B"H: THE EMERALD ACTIVATION
        // Check for specific shader name or keywords in the golem blueprint
        const isGrass = matName === 'AwtsmoosGrassMaterial' || 
                       (soulName && soulName.toLowerCase().includes("emerald")) ||
                       (matArgs && JSON.stringify(matArgs).includes("safegrass"));

        if (isGrass) {
             // B"H: silent

             material = await MaterialScribe.scribe('AwtsmoosGrassMaterial', {}, olamContext);
        } else if (matName === "MaterialArray" && Array.isArray(matArgs)) {
            material = await Promise.all(matArgs.map(async (m) => {
                const [n, a] = Object.entries(m)[0];
                const res = await MaterialScribe.scribe(n, a, olamContext);
                if (res) { res.side = THREE.DoubleSide; res.visible = true; }
                return res;
            }));
        } else {
            material = await MaterialScribe.scribe(matName, matArgs, olamContext);
            if (material) { material.side = THREE.DoubleSide; material.visible = true; }
        }

        // --- 3. ASSEMBLY ---
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = soulName;
        mesh.visible = true;
        
        // B"H: ABSOLUTE VISIBILITY FOR TERRAIN
        if (isGrass || soulName.includes("Ground") || soulName.includes("Terrain")) {
             mesh.frustumCulled = false;
        }
        
        mesh.updateMatrix();
        mesh.updateMatrixWorld(true);

        return mesh;

    } catch (e) {
        console.error(`B"H - 🚨 THE FORGE SHATTERED while manifesting [${soulName}]:`, e);
        return new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ color: 'red', visible: true }));
    }
}
