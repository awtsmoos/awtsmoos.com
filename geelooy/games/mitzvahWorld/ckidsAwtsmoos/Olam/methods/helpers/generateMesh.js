
/**
 * B"H
 * @file generateMesh.js
 * @description
 * 🛠️ CHAPTER 15: THE FORGE OF TOTAL MANIFESTATION 🛠️
 * 
 * A mesh without grounding is a fleeting thought. 
 * This master entry point for 3D construction utilizes 
 * GeometryCarver and MaterialScribe for granular control.
 * It operates with extreme speed, stripped of console clutter.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import GeometryCarver from './GeometryCarver.js';
import MaterialScribe from './MaterialScribe.js';

export default async function generateThreeJsMesh(golem, olamContext) {
    const soulName = golem.name || 'Anonymous Golem';
    
    try {
        // --- 1. BODY EXTRACTION ---
        const gufSchema = golem.guf || { "BoxGeometry": [1, 1, 1] };
        const [geoName, geoArgs] = Object.entries(gufSchema)[0];
        const geometry = GeometryCarver.carve(geoName, geoArgs);

        if (geometry && !geometry.boundingBox) {
            geometry.computeBoundingBox();
        }

        // --- 2. GARMENT WEAVING ---
        const toyrSchema = golem.toyr || { "MeshBasicMaterial": { color: "white" } };
        const [matName, matArgs] = Object.entries(toyrSchema)[0];
        
        let material;
        if (matName === "MaterialArray" && Array.isArray(matArgs)) {
            material = await Promise.all(matArgs.map(m => {
                const [n, a] = Object.entries(m)[0];
                return MaterialScribe.scribe(n, a, olamContext);
            }));
        } else {
            material = await MaterialScribe.scribe(matName, matArgs, olamContext);
        }

        // --- 3. THE ASSEMBLY ---
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = soulName;

        // B"H: THE FLOOR PRESERVATION ACT
        if (geometry.boundingBox && (geometry.boundingBox.max.x - geometry.boundingBox.min.x) > 500) {
             mesh.frustumCulled = false;
        }

        return mesh;

    } catch (e) {
        console.error(`B"H - 🚨 THE FORGE SHATTERED while manifestating [${soulName}]!`, e);
        return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 'red' }));
    }
}
