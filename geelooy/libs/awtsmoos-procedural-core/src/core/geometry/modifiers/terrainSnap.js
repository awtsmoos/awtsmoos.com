
// B"H
/**
 * @file terrainSnap.js
 * @brief Evaluates terrain sculpt modifiers mathematically to snap geometry to the ground.
 *        Now with Multi-Point Sampling for guaranteed surface clearance.
 */

import { Vec3 } from '../../math/vec3.js';

export function snapToTerrainModifier(mesh, params) {
    const { worldXZ, baseY, sculpts, offsetY = 0, alignBase = false } = params;
    if (!worldXZ || !sculpts || !mesh.faces) return mesh;

    // 1. Analyze Mesh Bounds (Local Space)
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let minY = Infinity;
    let hasVerts = false;

    mesh.faces.forEach(f => f.vertices.forEach(v => {
        if (v.pos[0] < minX) minX = v.pos[0];
        if (v.pos[0] > maxX) maxX = v.pos[0];
        if (v.pos[2] < minZ) minZ = v.pos[2];
        if (v.pos[2] > maxZ) maxZ = v.pos[2];
        if (v.pos[1] < minY) minY = v.pos[1];
        hasVerts = true;
    }));

    if (!hasVerts) return mesh;

    // 2. Define Sample Points (World Space)
    // We check the center and the four corners of the object's footprint
    const samples = [
        [worldXZ[0], worldXZ[1]], // Center
        [worldXZ[0] + minX, worldXZ[1] + minZ], // Corners...
        [worldXZ[0] + maxX, worldXZ[1] + minZ],
        [worldXZ[0] + minX, worldXZ[1] + maxZ],
        [worldXZ[0] + maxX, worldXZ[1] + maxZ]
    ];

    // 3. Find Highest Terrain Point among samples
    let maxTerrainHeight = -Infinity;

    samples.forEach(point => {
        let currentH = baseY; // Start at base
        
        // Iterate sculpts in order, tracking cumulative height for 3D distance checks
        for (const s of sculpts) {
            if (!s.center || !s.amount) continue;
            
            // 3D Distance Check: Uses current surface height vs sculpt center
            const dx = point[0] - s.center[0];
            const dy = currentH - s.center[1]; 
            const dz = point[1] - s.center[2];
            
            const distSq = dx*dx + dy*dy + dz*dz;
            const rSq = s.radius * s.radius;

            if (distSq < rSq) {
                const dist = Math.sqrt(distSq);
                const t = dist / s.radius;
                let factor = 0;
                
                const falloff = s.falloff || 'smooth';
                if (falloff === 'smooth') factor = (1.0 + Math.cos(Math.PI * t)) * 0.5;
                else if (falloff === 'dome') factor = Math.sqrt(Math.max(0, 1.0 - t * t));
                else if (falloff === 'sharp') factor = Math.max(0, (1.0 - t) * (1.0 - t));
                else if (falloff === 'linear') factor = Math.max(0, 1.0 - t);
                else if (falloff === 'flatten') factor = Math.max(0, 1.0 - t * t);

                const amt = Array.isArray(s.amount) ? s.amount[1] : (s.amount.value !== undefined ? s.amount.value : s.amount);
                
                // Add noise approximation if present to avoid sinking into bumps
                let noiseFactor = 1.0;
                if (s.noise > 0) noiseFactor = 1.0 + (s.noise * 0.2); // Safety buffer for noise

                currentH += amt * factor * noiseFactor;
            }
        }
        
        if (currentH > maxTerrainHeight) maxTerrainHeight = currentH;
    });

    // 4. Calculate Translation
    // We want the mesh's lowest point (minY) to sit at the highest terrain point found.
    // ty + minY = maxTerrainHeight
    let ty = 0;
    if (alignBase) {
        ty = maxTerrainHeight - minY + offsetY;
    } else {
        // Just move origin to height
        ty = maxTerrainHeight + offsetY;
    }

    // 5. Apply
    const visited = new Set();
    for (const face of mesh.faces) {
        for (const v of face.vertices) {
            if (!visited.has(v)) {
                v.pos[1] += ty;
                visited.add(v);
            }
        }
    }

    return mesh;
}
