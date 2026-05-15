
// B"H
import { generateProceduralGeometry } from '../../geometry/geometryGenerator.js';
import { CSG } from '../../geometry/csg/index.js';
import { meshToRenderData } from '../../geometry/utils/meshData.js';
import { computeSmoothNormalsModifier } from '../../geometry/utils/index.js';

/**
 * @file houseGenerator.js
 * @brief Manifests a colossal, explorable brick structure using Boolean mathematics.
 */

export function createCSGHouse(id, position) {
    const wallThickness = 4.0;
    // B"H - Monumental Dimensions
    const houseSize = [100, 60, 100]; 
    
    // 1. Outer Shell
    const shellData = generateProceduralGeometry('cube', { size: 1.0 });
    scaleMesh(shellData, houseSize);
    translateMesh(shellData,[0, houseSize[1]/2, 0]); 

    // 2. Inner Void (Carving out the massive hall)
    const innerSize =[
        houseSize[0] - wallThickness*2,
        houseSize[1] - wallThickness, 
        houseSize[2] - wallThickness*2
    ];
    const voidData = generateProceduralGeometry('cube', { size: 1.0 });
    scaleMesh(voidData, innerSize);
    translateMesh(voidData, [0, (houseSize[1]/2) + wallThickness, 0]);

    // 3. The Grand Entrance (Doorway)
    // Tall and wide enough to accommodate the Golem easily
    const doorDims = [25, 40, 12]; 
    const doorData = generateProceduralGeometry('cube', { size: 1.0 });
    scaleMesh(doorData, doorDims);
    // Punching through the front wall (+Z)
    translateMesh(doorData, [0, doorDims[1]/2 + wallThickness, houseSize[2]/2]);

    // 4. CSG Boolean Operations
    const shellCSG = CSG.fromMesh(shellData);
    const voidCSG = CSG.fromMesh(voidData);
    const doorCSG = CSG.fromMesh(doorData);

    let result = shellCSG.subtract(voidCSG).subtract(doorCSG).toMesh();
    result = computeSmoothNormalsModifier(result); 
    
    // Apply pure white vertex color to serve as a clean canvas for the procedural bricks
    if (result.faces) {
        result.faces.forEach(face => {
            face.vertices.forEach(v => {
                v.col =[1.0, 1.0, 1.0, 1.0];
            });
        });
    }

    return {
        id: id,
        primitive: 'none',
        ...meshToRenderData(result),
        shaderVars: { 
            uMaterialType: 'reflective',
            uTexture: 'brick',
            // Extremely tight UV scale ensures thousands of crisp bricks on the walls
            uTextureScale: 0.05, 
            uUseTriplanar: 1.0, 
            uRoughness: 0.9,
            uMetallic: 0.0,
            uBaseColor:[1, 1, 1] 
        },
        simulation: { type: 'static_collider' },
        keyframes:[{ time: 0, position: position }]
    };
}

function scaleMesh(mesh, s) {
    if(mesh.faces) {
        mesh.faces.forEach(f => f.vertices.forEach(v => {
            v.pos[0] *= s[0]; v.pos[1] *= s[1]; v.pos[2] *= s[2];
        }));
    }
}

function translateMesh(mesh, t) {
    if(mesh.faces) {
        mesh.faces.forEach(f => f.vertices.forEach(v => {
            v.pos[0] += t[0]; v.pos[1] += t[1]; v.pos[2] += t[2];
        }));
    }
}
