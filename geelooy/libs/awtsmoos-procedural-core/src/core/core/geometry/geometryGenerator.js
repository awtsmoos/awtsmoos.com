
// B"H
/** 
 * @file geometryGenerator.js 
 * @brief Manifests absolute primitives and routes them through the divine macro system.
 * 
 * THE HYMN OF THE SILENT VOID:
 * When grass is grown or water flows, no structured face appears,
 * Only positions in a flat array, washing away our fears.
 * The console shall no longer weep for faces it cannot see,
 * For flat array manifestation is a valid geometry!
 */

import { routePrimitive } from './generators/primitiveRouter.js';
import { processModifiers } from './modifiers/modifierProcessor.js';
import { computeFlatNormalsModifier } from './modifiers/flatNormals.js';
import { meshToRenderData } from './utils/meshData.js';
import { route } from '../utils/router.js';

export function generateProceduralGeometry(primitive, params, modifiers, objectData) {
    const safeObjectData = objectData || { id: "unnamed_vessel" };
    
    console.log(`\nB"H - 🌟 ==============================================`);
    console.log(`B"H - 🌟 MANIFESTING: [${safeObjectData.id}] (Type: ${primitive})`);
    console.log(`B"H - 🌟 ==============================================\n`);
    
    let mesh = routePrimitive(primitive, params);
    
    // A pure route to check if the mesh is a flat, pre-rendered buffer (like grass/particles)
    return route(mesh.positions && mesh.positions.constructor === Float32Array, {
        'true': () => {
            console.log(`B"H - [${safeObjectData.id}]: Pure Array Manifestation detected. Bypassing modifiers.`);
            return mesh;
        },
        'false': () => {
            // Apply all modifiers through the eternal chain
            mesh = processModifiers(mesh, modifiers, safeObjectData);
            
            // Check if we need flat normals
            mesh = route(mesh.faces && !mesh.hasSmoothNormals, {
                'true': () => {
                    console.log(`B"H - [${safeObjectData.id}]: Enforcing flat normals for faceted light reflection.`);
                    return computeFlatNormalsModifier(mesh);
                },
                'false': () => mesh
            });
            
            console.log(`B"H - [${safeObjectData.id}]: Converting structured mesh to flat WebGL buffers...`);
            const renderData = meshToRenderData(mesh);
            console.log(`B"H - [${safeObjectData.id}]: Manifestation complete. Vertex Count: ${renderData.positions.length / 3}.`);
            
            return renderData;
        }
    });
}
