
// B"H
/** 
 * @file geometryGenerator.js 
 * @brief Manifests absolute primitives and routes them through the divine macro system.
 *        Refactored into microscopic sub-modules for infinite purity.
 */

import { routePrimitive } from './generators/primitiveRouter.js';
import { processModifiers } from './modifiers/modifierProcessor.js';
import { computeFlatNormalsModifier } from './modifiers/flatNormals.js';
import { meshToRenderData } from './utils/meshData.js';

export function generateProceduralGeometry(primitive, params, modifiers, objectData) {
    if(!objectData || !objectData.id) {
        console.error("B\"H - 🚨 FATAL GENERATOR ERROR: objectData.id is missing. A vessel cannot be manifested without a name.");
        objectData = { id: "unnamed_vessel" };
    }
    
    console.log(`\nB"H - 🌟 ==============================================`);
    console.log(`B"H - 🌟 MANIFESTING: [${objectData.id}] (Type: ${primitive})`);
    console.log(`B"H - 🌟 ==============================================\n`);
    
    // 1. The Seed (Base Geometry)
    let mesh = routePrimitive(primitive, params);
    
    // Some primitives (like grass or grid) return raw render buffers immediately
    if (mesh.positions && mesh.positions.constructor === Float32Array) {
        console.log(`B"H - [${objectData.id}]: Primitive returned raw buffers directly. Bypassing modifiers.`);
        return mesh;
    }

    if (!mesh.faces || mesh.faces.length === 0) {
        console.warn(`B"H - ⚠️ [${objectData.id}]: Primitive generation yielded ZERO faces! The void remains.`);
    } else {
        console.log(`B"H - [${objectData.id}]: Base primitive spawned with ${mesh.faces.length} faces.`);
    }

    // 2. The Growth (Modifiers)
    mesh = processModifiers(mesh, modifiers, objectData);
    
    // 3. The Skin (Normals)
    if (mesh.faces && !mesh.hasSmoothNormals && mesh.faces.length > 0) {
        console.log(`B"H - [${objectData.id}]: Enforcing flat normals for faceted light reflection.`);
        mesh = computeFlatNormalsModifier(mesh);
    }
    
    // 4. The Final Form (Render Data)
    console.log(`B"H - [${objectData.id}]: Converting structured mesh to flat WebGL buffers...`);
    const renderData = meshToRenderData(mesh);
    console.log(`B"H - [${objectData.id}]: Manifestation complete. Vertex Count: ${renderData.positions.length / 3}.`);
    
    return renderData;
}
