
// B"H
import { generateProceduralGeometry } from '../../geometry/geometryGenerator.js';
import { CSG } from '../../geometry/csg/index.js';
import { computeSmoothNormalsModifier } from '../../geometry/modifiers/computeNormals.js';
import { meshToRenderData } from '../../geometry/utils/meshData.js';

/**
 * @file yarmulke.js
 * @brief Manifests a classic black velvet Yarmulke (Kippah).
 */

export function createYarmulke(id, config = {}) {
    // B"H - THE TIKKUN: Provide a minimal objectData context for the generator.
    const sphere = generateProceduralGeometry('icosphere', { radius: 1.0, subdivisions: 3, smooth: true }, [], { id: `${id}_sphere_source` });
    
    const cutter = generateProceduralGeometry('cube', { size: 3.0 }, [], { id: `${id}_cutter_source` });
    for (let i = 0; i < cutter.positions.length; i += 3) {
        cutter.positions[i + 1] -= 1.1; 
    }

    const csgS = CSG.fromMesh(sphere);
    const csgC = CSG.fromMesh(cutter);
    
    let res = csgS.subtract(csgC).toMesh();
    res = computeSmoothNormalsModifier(res);
    
    if (res.faces) {
        res.faces.forEach(face => {
            face.vertices.forEach(v => {
                v.col =[0.08, 0.08, 0.08, 1.0];
            });
        });
    }

    return {
        id: id,
        primitive: 'none',
        ...meshToRenderData(res),
        shaderVars: { 
            uMaterialType: 'lambert', 
            uBaseColor:[0.08, 0.08, 0.08], 
            uRoughness: 0.9 
        }
        // B"H - NO KEYFRAMES! Pure geometry.
    };
}
