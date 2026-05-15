
// B"H
import { MarchingCubes } from '../../geometry/marchingCubes.js';
import { updateScalarField } from '../../physics/metaballs/field.js';
import { meshToRenderData } from '../../geometry/utils/meshData.js';

/**
 * @file marchingCloudGenerator.js
 * @brief Generates physical 3D cloud meshes from a randomized particle field using Marching Cubes.
 */

export function createMarchingCloudCluster(id, position, scale) {
    const mc = new MarchingCubes();
    const resolution = 24; // High enough for fluff, low enough for speed
    const physicalSize = 100 * scale;
    
    // 1. Generate randomized particles to form the cloud's internal skeleton
    const particles =[];
    const numPuffs = 12 + Math.floor(Math.random() * 8);
    
    for (let i = 0; i < numPuffs; i++) {
        // Distribute heavily along X/Z, softly along Y (flat-bottomed clouds)
        const px = (Math.random() - 0.5) * physicalSize * 0.6;
        const py = (Math.random() - 0.3) * physicalSize * 0.2; 
        const pz = (Math.random() - 0.5) * physicalSize * 0.5;
        
        // Varing radii for organic shapes
        const r = (10 + Math.random() * 15) * scale;
        
        particles.push({ pos: [px, py, pz], radius: r });
    }

    // 2. Generate the Scalar Field
    const gridValues = new Float32Array(resolution ** 3);
    const center =[0, 0, 0];
    
    // We reuse the metaball field generator
    updateScalarField(gridValues, particles, resolution, physicalSize, center);

    // 3. Extract the Geometry
    const isoLevel = 0.5;
    const result = mc.generateMesh(gridValues, resolution, physicalSize, isoLevel, particles, center);

    // 4. Wrap into Renderable Object
    const vertCount = result.positions.length / 3;
    const colors = new Float32Array(vertCount * 4);
    
    // Tint slightly blue/gray at the bottom for shadow
    for (let i = 0; i < vertCount; i++) {
        const y = result.positions[i * 3 + 1];
        const heightPct = Math.max(0, Math.min(1, (y + physicalSize/4) / (physicalSize/2)));
        
        colors[i*4]     = 0.8 + 0.2 * heightPct; // R
        colors[i*4 + 1] = 0.85 + 0.15 * heightPct; // G
        colors[i*4 + 2] = 0.9 + 0.1 * heightPct; // B
        colors[i*4 + 3] = 1.0;
    }

    const renderData = meshToRenderData({
        positions: result.positions,
        normals: result.normals,
        indices: result.indices,
        colors: colors
    });

    return {
        id: id,
        primitive: 'none',
        ...renderData,
        shaderVars: { 
            uMaterialType: 'lambert', 
            uBaseColor: [1.0, 1.0, 1.0], 
            uRoughness: 1.0 
        },
        keyframes:[{ time: 0, position: position, rotation: [0, Math.random() * Math.PI, 0], scale:[1, 1, 1] }]
    };
}
